import qs from 'qs';
import { SpanKind } from '@opentelemetry/api';
import type {
  ReadableSpan,
  SpanProcessor,
  Span,
} from '@opentelemetry/sdk-trace-base';
import Logger from '@openagenda/logs/Logger';

const insightOpsKeys: Record<string, string> = (
  process.env.NEXT_INSIGHT_OPS ?? ''
)
  .split('|')
  .reduce<Record<string, string>>((ops, pair) => {
    const [key, value] = pair.split(':');
    ops[key] = value;
    return ops;
  }, {});

const log = new Logger({
  prefix: 'oa:',
  namespace: 'requests:incoming',
  enableDebug: process.env.NODE_ENV === 'development',
  token: insightOpsKeys.requests,
  otel: true,
});

const STATUS_COLORS: Record<number, number> = {
  5: 31,
  4: 33,
  3: 36,
  2: 32,
};

function getStatusColor(statusCode: number) {
  return STATUS_COLORS[Math.floor(statusCode / 100)] ?? 0;
}

function colored(txt: string | number, color = 0) {
  return process.env.NODE_ENV === 'development'
    ? `\x1b[${color}m${txt}\x1b[0m`
    : String(txt);
}

const mags = ' KMGTPEZY';

function humanSize(bytes: number, precision: number) {
  const magnitude = Math.min(
    (Math.log(bytes) / Math.log(1024)) | 0,
    mags.length - 1,
  );
  const result = bytes / 1024 ** magnitude;
  const suffix = `${mags[magnitude].trim()}B`;
  return result.toFixed(precision) + suffix;
}

/**
 * OpenTelemetry span processor that shadows each top-level Next.js request
 * span and emits a morgan-style log line to the `@openagenda/logs` Logger
 * (which exports to InsightOps via OTLP).
 *
 * Replaces the old `logRequest` middleware (morgan on a custom server),
 * which no longer has a place in App Router where Next owns the HTTP server.
 *
 * `visitor.id` and `user.uid` are set on the same root span by the
 * `spanStart` hook in `instrumentation-server.ts` (which runs before this
 * processor's `onEnd`). We simply read them here.
 */
export class RequestLogSpanProcessor implements SpanProcessor {
  // eslint-disable-next-line class-methods-use-this
  onStart(_span: Span): void {
    // no-op
  }

  // eslint-disable-next-line class-methods-use-this
  onEnd(span: ReadableSpan): void {
    // Root HTTP request span: SERVER kind with no local parent. A remote
    // parent (distributed trace incoming via traceparent) is still a root
    // for this process. Stable filter across Next majors and OTel versions,
    // independent of the `next.span_type` internal attribute.
    if (span.kind !== SpanKind.SERVER) return;
    if (span.parentSpanContext && !span.parentSpanContext.isRemote) return;
    // Skip the middleware-only root span. Next.js creates a separate root
    // `BaseServer.handleRequest` trace for the middleware (proxy.ts) pass,
    // which throws a BubbledError to signal "continue"; the tracer tags that
    // span with `next.bubble: true`. The subsequent page render creates its
    // own root span that we do want to log. Without this filter we emit two
    // request log lines per page view (one for the middleware trace, one for
    // the page route).
    if (span.attributes['next.bubble'] === true) return;

    // OTel HTTP semconv was renamed in v1.27 (stable 2024). Read both names
    // so logs survive whenever Next's instrumentation migrates.
    const method = String(
      span.attributes['http.request.method'] ??
        span.attributes['http.method'] ??
        '',
    );
    const rawUrl = String(
      span.attributes['url.path'] ??
        span.attributes['http.target'] ??
        span.attributes['http.url'] ??
        span.attributes['next.route'] ??
        '',
    );
    const status = Number(
      span.attributes['http.response.status_code'] ??
        span.attributes['http.status_code'] ??
        0,
    );
    const contentLength =
      Number(
        span.attributes['http.response.body.size'] ??
          span.attributes['http.response_content_length'],
      ) || undefined;

    const [path, search] = rawUrl.split('?');
    const query = search ? qs.parse(search) : {};

    const [durSec, durNano] = span.duration;
    const responseTime = durSec * 1000 + durNano / 1_000_000;

    const data = {
      method,
      path,
      url: rawUrl,
      query,
      status,
      contentLength,
      responseTime,
    };

    if (process.env.NODE_ENV === 'production') {
      (log as any).info(data);
    } else {
      const color = getStatusColor(status);
      (log as any).info(
        [
          `"${method} ${colored(rawUrl, 1)}"`,
          colored(colored(status, color), 1),
          contentLength ? humanSize(contentLength, 2) : '-',
          '~',
          `${responseTime.toFixed(0)}ms`,
        ].join(' '),
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
