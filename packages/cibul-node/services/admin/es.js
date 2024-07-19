/* eslint-disable no-param-reassign */

import http from 'node:http';

function _handleResponse(cb) {
  return res => {
    const response = [];

    res.setEncoding('utf8');

    res.on('data', chunk => {
      response.push(chunk);
    });

    res.on('end', () => {
      let result = {};

      if (response.length) result = JSON.parse(response.join(''));

      result.statusCode = res.statusCode;

      cb(result.errors || result.error || null, result);
    });
  };
}

function _request(config, method, path, data, cb) {
  const clean = typeof data !== 'string' ? JSON.stringify(data) : data;

  const req = http.request({
    host: config.host,
    port: config.port,
    path,
    method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': clean ? Buffer.byteLength(clean) : 0,
    },
  }, _handleResponse(cb));

  req.write(clean);

  req.end();
}

export default function query(config, type, dsl, cb) {
  if (!cb) {
    cb = dsl;
    dsl = {};
  }

  const endPoint = !type.includes('/') ? `${type}/_search` : type;
  const method = dsl && Object.keys(dsl).length ? 'post' : 'get';

  _request(config, method, `/${config.indexName}/${endPoint}`, dsl, cb);
}
