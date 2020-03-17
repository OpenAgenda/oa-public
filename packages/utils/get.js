"use strict";

var xhr = require('xhr'),

  qs = require('qs');

module.exports = function(res, data, cb) {

  if (arguments.length === 2) {

    cb = data;

    data = {};

  }

  var query = qs.stringify(data),

  separator;

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

};
