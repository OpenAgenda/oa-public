import type {
  ReadableSpan,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { SESSION_COOKIE_NAME } from '../config/constants';
import { parseSessionCookie } from './getSession';

const SESSION_COOKIE_ATTR = `http.request.header.cookie.${SESSION_COOKIE_NAME}`;

/**
 * Attach `session.id` and `user.uid` to every root HTTP request span by
 * decoding the `oa.user` cookie from the span's
 * `http.request.header.cookie.oa.user` attribute (set upstream by the active
 * HTTP instrumentation — currently `@opentelemetry/instrumentation-http`,
 * registered via Sentry).
 *
 * Why a span processor and not the React tree?
 * App Router caches shared layouts across RSC soft navigations: RootLayout
 * does not re-execute on `/fr/a → /fr/b` client-side nav, so enriching the
 * active span from a Server Component only works on full page loads. The
 * cookie attribute, however, is populated on *every* request span by the
 * HTTP integration, making this the only reliable place to do it.
 *
 * Why `onEnd` and not `onStart`?
 * Empirically verified: the HTTP instrumentation populates
 * `http.request.header.cookie.oa.user` AFTER `onStart` but BEFORE `onEnd`
 * (tested on both full page loads and RSC soft navigations — cookie attribute
 * is missing at onStart in both cases). `onEnd` is therefore the only point
 * at which the cookie is reliably available.
 *
 * Must be registered BEFORE `RequestLogSpanProcessor` in the SDK's
 * `spanProcessors` array: `MultiSpanProcessor.onEnd` invokes processors in
 * registration order, so the log processor then reads the freshly populated
 * `session.id` / `user.uid`.
 *
 * Implementation note: `setAttribute` is a no-op after `end()` (see
 * `@opentelemetry/sdk-trace-base` Span.js: `_isSpanEnded()` guard). We
 * therefore mutate `span.attributes` directly — it is a plain object on the
 * underlying `SpanImpl` and survives `onEnd`.
 */
export class SessionAttributesSpanProcessor implements SpanProcessor {
  private warnedMissingCookieAttr = false;

  // eslint-disable-next-line class-methods-use-this
  onStart(): void {
    // no-op: cookie attribute is not yet populated at onStart (see class JSDoc)
  }

  // eslint-disable-next-line class-methods-use-this
  onEnd(span: ReadableSpan): void {
    // Only decorate the root Next.js request span — this matches exactly the
    // set of spans `RequestLogSpanProcessor` emits a log line for, so there
    // is no point enriching anything else.
    if (span.attributes['next.span_type'] !== 'BaseServer.handleRequest')
      return;
    // Skip the middleware-only root trace (proxy.ts). RequestLogSpanProcessor
    // already filters this out of the logs, so enriching it is wasted work.
    if (span.attributes['next.bubble'] === true) return;

    if (span.attributes['session.id'] && span.attributes['user.uid']) return;

    const cookieValue = span.attributes[SESSION_COOKIE_ATTR];
    if (typeof cookieValue !== 'string') {
      // The cookie attribute is emitted by the active HTTP instrumentation
      // (today: @opentelemetry/instrumentation-http, registered via Sentry —
      // but any HTTP instrumentation that flattens cookies per name into
      // `http.request.header.cookie.<name>` attributes will work).
      // Fail loud in dev so a regression is caught before production.
      if (
        process.env.NODE_ENV === 'development' &&
        !this.warnedMissingCookieAttr
      ) {
        this.warnedMissingCookieAttr = true;
        // eslint-disable-next-line no-console
        console.warn(
          `[SessionAttributesSpanProcessor] span attribute "${SESSION_COOKIE_ATTR}" is missing — session.id / user.uid won't be attached. Verify the HTTP instrumentation is registered and still emits cookies under this attribute naming.`,
        );
      }
      return;
    }

    const session = parseSessionCookie(cookieValue);
    if (!session) return;

    // Mutate the plain attributes object directly: `setAttribute` is a no-op
    // after the span has ended (the SDK guards on `_isSpanEnded()`), but the
    // `attributes` map is a regular object and the downstream processors in
    // this tick see our writes.
    const attrs = (span as unknown as { attributes: Record<string, unknown> })
      .attributes;
    if (session.sessionId && !attrs['session.id']) {
      attrs['session.id'] = session.sessionId;
    }
    if (session.user?.uid && !attrs['user.uid']) {
      attrs['user.uid'] = session.user.uid;
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
