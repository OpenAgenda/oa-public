'use strict';

const fs = require('fs');
const multer = require('multer');
const processFile = require('./processFile');
const TempStorage = require('./TempStorage');
const s3 = require('./providers/s3');
const makeMiddleware = require('./makeMiddleware');
const isFile = require('./isFile');
const gm = require('./gm');

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

function cleanup() {
  return (req, res, next) => {
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
}

module.exports = cfg => {
  const providers = {
    s3: cfg.s3 ? s3(cfg.s3) : null
  };

  function filesManager(options) {
    async function upload(data, context) {
      const isMultiple = Array.isArray(options);
      const keyedData = !isFile(data) && (typeof data === 'object' && !Array.isArray(data));

      if (isMultiple && !keyedData) {
        throw new Error('Cannot process multiple files without keyed data');
      }

      const promises = [];
      const filesRegistry = new Map();

      async function addFile(file, fileOptions) {
        const {
          promise,
          registry
        } = await processFile(cfg, providers, file, fileOptions, context, true);

        promises.push(promise);
        filesRegistry.set(fileOptions, registry);
      }

      for (const fileOptions of (isMultiple ? options : [options])) {
        if (isMultiple && !data[fileOptions.key]) {
          continue;
        }

        if (
          Array.isArray(data[fileOptions.key])
          && (data[fileOptions.key].every(isFile) || data[fileOptions.key].every(Array.isArray))
        ) {
          for (const file of data[fileOptions.key]) {
            await addFile(file, fileOptions);
          }
        } else if (Array.isArray(data[fileOptions.key]) && Array.isArray(data[fileOptions.key][0])) {
          for (const file of data[fileOptions.key][0]) {
            await addFile([file, data[fileOptions.key][1]], fileOptions);
          }
        } else {
          if (!isMultiple) {
            const fileData = keyedData ? data[options.key] : data;

            return processFile(cfg, providers, fileData, options, context)
              .then(transformResult)
          }

          await addFile(!isMultiple && !keyedData ? data : data[fileOptions.key], fileOptions);
        }
      }

      return Promise.all(promises)
        .then(
          transformResult,
          async error => {
            await abortAllUploads(filesRegistry);

            throw error;
          }
        );
    }

    upload.multer = multer({
      storage: new TempStorage({ cfg, providers, options })
    });

    upload.cleanup = cleanup;

    upload.middleware = makeMiddleware(upload);

    upload.providers = providers;

    return upload;
  }

  filesManager.providers = providers;

  filesManager.gm = gm;

  return filesManager;
};


