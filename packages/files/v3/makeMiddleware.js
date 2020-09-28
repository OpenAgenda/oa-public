'use strict';

const { Router } = require('express');
const is = require('type-is');

function getMulterMw(svc, fields) {
  switch (fields) {
    case 'any':
      return svc.multer.any();
    case 'none':
      return svc.multer.none();
    default:
      return svc.multer.fields(
        fields.map(field => {
          if (!field.unique) {
            return field;
          }

          return {
            ...field,
            maxCount: 1
          };
        })
      );
  }
}

function uniqueFields(fields) {
  return (req, res, next) => {
    if (!req.files) {
      return next();
    }

    for (const field of fields) {
      const value = req.files[field.name];

      if (field.unique && Array.isArray(value)) {
        req.files[field.name] = value[0];
      }
    }

    next();
  };
}

function mixedMultipartMw(dataKey = 'data') {
  return (req, res, next) => {
    if (!is(req, ['multipart'])) return next();

    try {
      const rawBody = req.body[dataKey];
      const body = JSON.parse(rawBody);

      req.body = Object.assign(body, req.files);

      next();
    } catch (e) {
      next(new Error('Body parse error'));
    }
  };
}

module.exports = function makeMiddleware(svc) {
  return (fields = 'none', options = {}) => {
    const {
      cleanup = true,
      mixedMultipart = 'data'
    } = options;

    const router = Router({ mergeParams: true });

    router.use(
      getMulterMw(svc, fields),
      uniqueFields(fields)
    );

    if (cleanup) {
      router.use(svc.cleanup());
    }

    if (mixedMultipart) {
      router.use(mixedMultipartMw(mixedMultipart));
    }

    return router;
  };
}
