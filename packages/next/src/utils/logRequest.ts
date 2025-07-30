import qs from 'qs';
import morgan from 'morgan';
import Logger from '@openagenda/logs/Logger';

const insightOpsKeys: Record<string, string> = (
  process.env.NEXT_INSIGHT_OPS ?? ''
)
  .split('|')
  .reduce((ops, pair) => {
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

const logRequest = morgan?.((tokens, req, res) => {
  const statusCode = headersSent(res) ? res.statusCode : undefined;
  const color = getStatusColor(statusCode);

  const url = tokens.url(req, res);
  const [path, search] = url.split('?');
  const query = search ? qs.parse(search) : {};

  const data = {
    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '',
    method: tokens.method(req, res),
    path,
    url,
    httpVersion: tokens['http-version'](req, res),
    query,
    status: parseInt(tokens.status(req, res), 10),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTime: tokens['response-time'](req, res) || NaN,
  };

  if (process.env.NODE_ENV === 'production') {
    log.info(data as any);
  } else {
    const {
      method,
      // url,
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

  return null;
});

export default logRequest;
