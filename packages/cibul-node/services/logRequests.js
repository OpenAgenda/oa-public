'use strict';

const path = require('path');
const morgan = require('morgan');
const log = require('@openagenda/logs')('incoming');


const blacklist = [
  /^\/legacy/
];

morgan.token('client-ip', req => {
  let clientIp;

  if (req.headers['cf-connecting-ip'] && req.headers['cf-connecting-ip'].length) {
    let first = req.headers['cf-connecting-ip'].split(', ')[0];
    clientIp = first;
  }

  if (!clientIp) {
    clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  }

  return clientIp;
});

morgan.token('path', req => req.path);

function init(config) {

  log.setConfig(config.getLogConfig('oa', 'requests'));

}

const middleware = morgan(
  (tokens, req, res) => {
    const statusCode = headersSent(res)
      ? res.statusCode
      : undefined;

    // get status color
    const color = statusCode >= 500 ? 31 // red
      : statusCode >= 400 ? 33 // yellow
        : statusCode >= 300 ? 36 // cyan
          : statusCode >= 200 ? 32 // green
            : 0; // no color

    const { query } = req;

    const data = {
      ip: tokens['client-ip'](req, res),
      method: tokens.method(req, res),
      path: tokens.path(req, res),
      url: tokens.url(req, res),
      httpVersion: tokens['http-version'](req, res),
      query,
      key: query?.key || null,
      status: parseInt(tokens.status(req, res)),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: tokens['response-time'](req, res) || NaN,
      secure: req.secure,
    };

    if (process.env.NODE_ENV === 'production') {
      log.info(data);
    } else {
      const { method, url, httpVersion, ip, status, contentLength, responseTime } = data;

      log.info(withColor(
        [
          `"${method} ${colored(url, 1)} HTTP/${httpVersion}"`,
          ip,
          colored(colored(status, color), 1),
          contentLength ? humanSize(contentLength, 2) : '-',
          '~',
          `${responseTime}ms`
        ].join(' ')
      ));
    }

    return;
  },
  {
    skip: req => blacklist.some(regexp => regexp.test(req.originalUrl))
  }
);

function headersSent(res) {
  return typeof res.headersSent !== 'boolean'
    ? Boolean(res._header)
    : res.headersSent;
}

function withColor(txt) {
  return process.env.NODE_ENV === 'development' ? `\x1b[0m${txt}\x1b[0m` : txt;
}

function colored(txt, color = 0) {
  return process.env.NODE_ENV === 'development' ? `\x1b[${color}m${txt}\x1b[0m` : txt;
}

const mags = ' KMGTPEZY';

function humanSize(bytes, precision) {
  const magnitude = Math.min(Math.log(bytes) / Math.log(1024) | 0, mags.length - 1);
  const result = bytes / Math.pow(1024, magnitude);
  const suffix = mags[magnitude].trim() + 'B';

  return result.toFixed(precision) + suffix;
}


module.exports = {
  init,
  middleware
};
