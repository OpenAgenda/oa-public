'use strict';

const { Router } = require('express');
const mixedMultipartMw = require('./mixedMultipartMw');
const cleanupMw = require('./cleanupMw');

function getMulterMw(multer, fields) {
  switch (fields) {
    case 'any':
      return multer.any();
    case 'none':
      return multer.none();
    default:
      return multer.fields(
        fields.map(field => {
          if (!field.unique) {
            return field;
          }

          return {
            ...field,
            maxCount: 1,
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
      const originalValue = files && files[field.name];

      if (!value) {
        continue;
      }

      if (Array.isArray(value)) {
        body[field.name] = value.reduce((accu, file, index) => {
          const originalPath = originalValue && originalValue[index] && originalValue[index].path;

          if (
            typeof file === 'object'
            && file !== null
            && 'path' in file
            && file.path !== originalPath
          ) {
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
      } else if (
        typeof value === 'object'
        && value !== null
        && 'path' in value
        && value.path !== (originalValue && originalValue.path)
      ) {
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

module.exports = function makeMiddleware(multer) {
  return (fields = 'none', options = {}) => {
    const { cleanup = true, mixedMultipart = 'data' } = options;

    const router = Router({ mergeParams: true });

    router.use(getMulterMw(multer, fields), uniqueFields(fields));

    if (cleanup) {
      router.use(cleanupMw());
    }

    if (mixedMultipart) {
      router.use(mixedMultipartMw(mixedMultipart));
    }

    router.use(filterFakeFiles(fields));

    return router;
  };
};
