'use strict';

const fs = require('fs');
const isStream = require('is-stream');
const multer = require('multer');
const processFile = require('./processFile');
const TempStorage = require('./TempStorage');
const s3 = require('./providers/s3');

function transformResult(result) {
  const asArray = {};

  if (Array.isArray(result)) {
    return result.reduce((accu, current) => {
      const key = Array.isArray(current) ? current[0].key : current.key;

      if (accu[key]) {
        if (asArray[key]) {
          accu[key].push(current);

          return accu;
        }

        asArray[key] = true;

        return {
          ...accu,
          [key]: [accu[key], current]
        };
      }

      return {
        ...accu,
        [key]: current
      };
    }, {})
  }

  return result;
}

function abortAllUploads(filesRegistry) {
  const promises = [];

  for (const [, variantsRegistry] of filesRegistry) {
    for (const [, item] of variantsRegistry) {
      promises.push(item.abort());
    }
  }

  return Promise.all(promises);
}

module.exports = cfg => {
  const providers = {
    s3: cfg.s3 ? s3(cfg.s3) : null
  };

  function filesManager(options) {
    async function upload(data, context) {
      const isMultiple = Array.isArray(options);
      const keyedData = !isStream(data) && (typeof data === 'object' && !Array.isArray(data));

      if (isMultiple && !keyedData) {
        throw new Error('Cannot process multiple files without keyed data');
      }

      if (isMultiple) {
        const promises = [];
        const filesRegistry = new Map();

        for (const fileOptions of options) {
          if (!data[fileOptions.key]) {
            continue;
          }

          const {
            promise,
            registry
          } = await processFile(cfg, providers, data[fileOptions.key], fileOptions, context, true);

          promises.push(promise);
          filesRegistry.set(fileOptions, registry);
        }

        return Promise.all(promises)
          .then(
            transformResult,
            async error => {
              await abortAllUploads(filesRegistry);

              throw error;
            }
          );
      } else {
        const fileData = keyedData ? data[options.key] : data;

        return processFile(cfg, providers, fileData, options, context)
          .then(transformResult);
      }
    }

    upload.multer = multer({
      storage: new TempStorage({ cfg, providers, options })
    });

    upload.cleanup = () => (req, res, next) => {
      const _cleanup = file => {
        if (Array.isArray(file)) {
          return file.forEach(f => _cleanup(f));
        }

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      res.on('finish', () => {
        if (req.file) {
          _cleanup(req.file);
        }

        if (req.files) {
          Object.keys(req.files).forEach(name => _cleanup(req.files[name]));
        }
      });

      next();
    };

    upload.providers = providers;

    return upload;
  }

  filesManager.providers = providers;

  return filesManager;
};


