'use strict';

const { Router } = require('express');
const mixedMultipartMw = require('./mixedMultipartMw');
const cleanupMw = require('./cleanupMw');

function normalizeField(field) {
  if (typeof field === 'string') {
    return {
      name: field,
      unique: true,
      maxCount: 1,
    };
  }

  if (field.unique) {
    return {
      ...field,
      maxCount: 1,
    };
  }

  return field;
}

function getMulterMw(multer, fields) {
  switch (fields) {
    case 'any':
      return multer.any();
    case 'none':
      return multer.none();
    default:
      return multer.fields(fields);
  }
}

function uniqueFields(fields) {
  return (req, res, next) => {
    const { files } = req;

    if (!files || fields === 'any' || fields === 'none') {
      return next();
    }

    for (const field of fields) {
      const value = files[field.name];

      if (field.unique && Array.isArray(value)) {
        [files[field.name]] = value;
      }
    }

    next();
  };
}

function filterFakeFiles(fields) {
  return (req, res, next) => {
    const { body, files } = req;

    if (!body || fields === 'none') {
      return next();
    }

    if (fields === 'any' && !files) {
      return next();
    }

    const fieldsToCheck = fields === 'any'
      ? files.reduce((accu, key) => {
        if (!accu.find(v => v.name === key)) {
          accu.push({ name: key });
        }
        return accu;
      }, [])
      : fields;

    for (const field of fieldsToCheck) {
      const value = body[field.name];
      const originalValue = files?.[field.name];

      if (!value) {
        continue;
      }

      if (Array.isArray(value)) {
        body[field.name] = value.reduce((accu, file, index) => {
          if (
            typeof file === 'object'
            && file !== null
            && 'path' in file
            && file.path !== originalValue?.[index]?.path
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
        && value.path !== originalValue?.path
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

    const normalizedFields = fields === 'none' || fields === 'any'
      ? fields
      : [].concat(fields).map(normalizeField);

    router.use(
      getMulterMw(multer, normalizedFields),
      uniqueFields(normalizedFields)
    );

    if (cleanup) {
      router.use(cleanupMw());
    }

    if (mixedMultipart) {
      router.use(mixedMultipartMw(mixedMultipart));
    }

    router.use(filterFakeFiles(normalizedFields));

    return router;
  };
};
