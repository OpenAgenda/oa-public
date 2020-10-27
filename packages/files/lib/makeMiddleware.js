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
    const { files } = req;

    if (!files) {
      return next();
    }

    for (const field of fields) {
      const value = files[field.name];

      if (field.unique && Array.isArray(value)) {
        // eslint-disable-next-line prefer-destructuring
        files[field.name] = value[0];
      }
    }

    next();
  };
}

function filterFakeFiles(fields) {
  return (req, res, next) => {
    const { body, files } = req;

    if (!body) {
      return next();
    }

    for (const field of fields) {
      const value = body[field.name];
      const originalValue = files?.[field.name];

      if (!value) {
        continue;
      }

      if (Array.isArray(value)) {
        body[field.name] = value.reduce((accu, file, index) => {
          const originalPath = originalValue && originalValue[index] && originalValue[index].path;

          if ('path' in file && file.path !== originalPath) {
            if (Object.keys(file).length > 1) {
              delete file.path;
              accu.push(file);
            }

            return accu;
          }

          accu.push(file);
          return accu;
        }, []);

        if (body[field.name].length === 0) {
          delete body[field.name];
        }
      } else if ('path' in value && value.path !== (originalValue && originalValue.path)) {
        if (Object.keys(value).length === 1) {
          delete body[field.name];
        } else {
          delete value.path;
        }
      }
    }

    next();
  };
}

function mixedMultipartMw(dataKey = 'data') {
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
}

module.exports = function makeMiddleware(svc) {
  return (fields = 'none', options = {}) => {
    const { cleanup = true, mixedMultipart = 'data' } = options;

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

    router.use(filterFakeFiles(fields));

    return router;
  };
};
