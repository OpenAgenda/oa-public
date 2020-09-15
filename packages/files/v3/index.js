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

        for (const fileOptions of options) {
          if (!data[fileOptions.key]) {
            continue;
          }

          promises.push(processFile(cfg, providers, data[fileOptions.key], fileOptions, context));
        }

        return Promise.all(promises)
          .then(transformResult);
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


