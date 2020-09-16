'use strict';

const isStream = require('is-stream');
const multer = require('multer');
const processFile = require('./processFile');
const StreamStorage = require('./StreamStorage');
const s3 = require('./providers/s3');

function transformResult(result) {
  if (Array.isArray(result)) {
    return result.reduce((accu, current) => {
      if (Array.isArray(current)) {
        return {
          ...accu,
          [current[0].key]: current
        }
      }

      return {
        ...accu,
        [current.key]: current
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

  return options => {
    const process = async (data, context) => {
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
        return processFile(cfg, providers, data, options, context)
          .then(transformResult);
      }
    };

    process.multer = multer({
      storage: new StreamStorage(cfg, providers, options)
    });

    return process;
  };
};


