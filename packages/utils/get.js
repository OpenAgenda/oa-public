"use strict";

const xhr = require('xhr');
const qs = require('qs');

function get(res, data, cb) {

  if (arguments.length === 2) {

    cb = data;

    data = {};

  }

  const query = qs.stringify(data);
  let separator;

  if ((!res || !res.length) && window) {

    res = window.location.href;

  }

  separator = res.indexOf('?') === -1 ? '?' : '&';

  xhr({
    uri: res + (query ? separator + query : ''),
    method: 'get',
    json: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  }, function(err, result) {

    if (err) return cb(err);

    if (result.statusCode !== 200) {

      return cb({ statusCode: result.statusCode });

    }

    cb(null, result.body);

  });

}

module.exports = get;

module.exports.promise = (res, data = {}) => {
  return new Promise((resolve, reject) => {
    get(res, data, (err, result) => (err ? reject(err) : resolve(result)));
  });
};
