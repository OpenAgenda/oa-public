'use strict';

const is = require('type-is');

module.exports = function mixedMultipartMw(dataKey = 'data') {
  return (req, res, next) => {
    if (!is(req, ['multipart'])) return next();

    try {
      const rawBody = req.body && req.body[dataKey];

      if (rawBody) {
        const body = JSON.parse(rawBody);

        delete req.body[dataKey];

        Object.assign(req.body, body);
      }

      Object.assign(req.body, req.files);
    } catch (e) {
      return next(new Error('Body parse error'));
    }

    next();
  };
};
