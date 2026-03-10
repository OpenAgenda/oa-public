import morgan from 'morgan';
import onFinished from 'on-finished';
import logs from '@openagenda/logs';
import { trace, context } from '@opentelemetry/api';

const log = logs('incoming');

const blacklist = [/^\/(?:legacy|monit)(?:\/|$)/];

const tracer = trace.getTracer('cibul-node');

morgan.token('client-ip', (req) => {
  let clientIp;

  if (
    req.headers['cf-connecting-ip']
    && req.headers['cf-connecting-ip'].length
  ) {
    [clientIp] = req.headers['cf-connecting-ip'].split(', ');
  }

  if (!clientIp) {
    clientIp = req.headers['x-forwarded-for']
      || req.headers['x-real-ip']
      || req.connection.remoteAddress
      || req.socket.remoteAddress
      || req.connection.socket.remoteAddress;
  }

  return clientIp;
});

morgan.token('path', (req) => req.path);

function headersSent(res) {
  return typeof res.headersSent !== 'boolean'
    ? Boolean(res._header)
    : res.headersSent;
}

function withColor(txt) {
  return process.env.NODE_ENV === 'development' ? `\x1b[0m${txt}\x1b[0m` : txt;
}

function colored(txt, color = 0) {
  return process.env.NODE_ENV === 'development'
    ? `\x1b[${color}m${txt}\x1b[0m`
    : txt;
}

const mags = ' KMGTPEZY';

function humanSize(bytes, precision) {
  const magnitude = Math.min(
    (Math.log(bytes) / Math.log(1024)) | 0,
    mags.length - 1,
  );
  const result = bytes / 1024 ** magnitude;
  const suffix = `${mags[magnitude].trim()}B`;

  return result.toFixed(precision) + suffix;
}

function getStatusColor(statusCode) {
  // get status color
  if (statusCode >= 500) {
    return 31; // red
  }
  if (statusCode >= 400) {
    return 33; // yellow
  }
  if (statusCode >= 300) {
    return 36; // cyan
  }
  if (statusCode >= 200) {
    return 32; // green
  }
  return 0; // no color
}

const logMw = morgan(
  (tokens, req, res) => {
    const statusCode = headersSent(res) ? res.statusCode : undefined;
    const color = getStatusColor(statusCode);

    const { query } = req;

    const data = {
      ip: tokens['client-ip'](req, res),
      method: tokens.method(req, res),
      path: tokens.path(req, res),
      url: tokens.url(req, res),
      httpVersion: tokens['http-version'](req, res),
      query,
      key: query?.key || null,
      status: parseInt(tokens.status(req, res), 10),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: tokens['response-time'](req, res) || NaN,
      secure: req.secure,
    };

    if (req.times) {
      data.times = req.times;
    }

    // trace in finished here, we need to force context for logs
    const finalSpan = req[Symbol.for('oa.otel.span')];

    context.with(trace.setSpan(context.active(), finalSpan), () => {
      if (process.env.NODE_ENV === 'production') {
        log.info(data);
      } else {
        const {
          method,
          url,
          httpVersion,
          ip,
          status,
          contentLength,
          responseTime,
        } = data;

        log.info(
          withColor(
            [
              `"${method} ${colored(url, 1)} HTTP/${httpVersion}"`,
              ip,
              colored(colored(status, color), 1),
              contentLength ? humanSize(contentLength, 2) : '-',
              '~',
              `${responseTime}ms`,
            ].join(' '),
          ),
        );
      }

      req.otelFinishSpan?.end();
    });
  },
  {
    skip: (req) => blacklist.some((regexp) => regexp.test(req.originalUrl)),
  },
);

export const middleware = (req, res, next) => {
  const ctx = context.active();
  const activeSpan = trace.getActiveSpan();

  if (!activeSpan) {
    return logMw(req, res, next);
  }

  // open a span for "on-finished" and close it in morgan callback
  onFinished(
    res,
    context.bind(ctx, () => {
      tracer.startActiveSpan(
        'response.finish',
        undefined,
        ctx, // même traceId
        (span) => {
          req.otelFinishSpan = span;
        },
      );
    }),
  );

  logMw(req, res, () => {});

  next();
};

export function init(config) {
  log.setConfig(config.getLogConfig('oa', 'requests'));
}
