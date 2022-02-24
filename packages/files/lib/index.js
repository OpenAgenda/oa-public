'use strict';

const multer = require('multer');
const processFile = require('./processFile');
const TempStorage = require('./TempStorage');
const s3 = require('./providers/s3');
const makeMiddleware = require('./makeMiddleware');
const cleanupMw = require('./cleanupMw');
const mixedMultipartMw = require('./mixedMultipartMw');
const isFile = require('./isFile');
const gm = require('./gm');

function transformAndUpload(cfg, providers, options) {
  return (file, context) => {
    const fileOptions = (Array.isArray(options) ? options : [options]).find(
      option => option.key === file.fieldname
    );

    if (!fileOptions) {
      throw new Error(`Unable to find options for file '${file.fieldname}'`);
    }

    return processFile(cfg, providers, file, fileOptions, context);
  };
}

function transformResult(resultKey) {
  return value => {
    const asArray = {};
    let result = value;

    if (Array.isArray(value)) {
      result = value.reduce((accu, current) => {
        const key = Array.isArray(current) ? current[0].key : current.key;

        if (accu[key]) {
          if (asArray[key]) {
            accu[key].push(current);

            return accu;
          }

          asArray[key] = true;

          return {
            ...accu,
            [key]: [accu[key], current],
          };
        }

        return {
          ...accu,
          [key]: current,
        };
      }, {});
    }

    return resultKey && result[resultKey] ? result[resultKey] : result;
  };
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
    s3: cfg.s3 ? s3(cfg.s3) : null,
  };

  function filesManager(options) {
    async function upload(data, context) {
      const isMultiple = Array.isArray(options);
      const keyedData = !isFile(data) && typeof data === 'object' && !Array.isArray(data);

      if (isMultiple && !keyedData) {
        throw new Error('Cannot process multiple files without keyed data');
      }

      const promises = [];
      const filesRegistry = new Map();

      async function addFile(file, fileOptions) {
        const { promise, registry } = await processFile(
          cfg,
          providers,
          file,
          fileOptions,
          context,
          true
        );

        promises.push(promise);
        filesRegistry.set(fileOptions, registry);
      }

      for (const fileOptions of Array.isArray(options) ? options : [options]) {
        const fileData = keyedData ? data[fileOptions.key] : data;

        if (keyedData && !data[fileOptions.key]) {
          continue;
        }

        if (
          Array.isArray(fileData)
          && (fileData.every(isFile) || fileData.every(Array.isArray))
        ) {
          for (const file of fileData) {
            await addFile(file, fileOptions);
          }
        } else if (Array.isArray(fileData) && Array.isArray(fileData[0])) {
          for (const file of fileData[0]) {
            await addFile([file, fileData[1]], fileOptions);
          }
        } else {
          await addFile(fileData, fileOptions);
        }
      }

      return Promise.all(promises).then(
        transformResult(!isMultiple && !keyedData ? options.key : null),
        async error => {
          await abortAllUploads(filesRegistry);

          throw error;
        }
      );
    }

    upload.multer = multer({
      storage: new TempStorage({
        transformAndUpload: transformAndUpload(cfg, providers, options),
      }),
    });

    upload.middleware = makeMiddleware(upload.multer);

    upload.providers = providers;

    upload.cleanup = cleanupMw;

    return upload;
  }

  filesManager.providers = providers;

  filesManager.gm = gm;

  filesManager.cleanup = cleanupMw;

  return filesManager;
};

module.exports.makeMiddleware = makeMiddleware;

module.exports.cleanupMw = cleanupMw;

module.exports.mixedMultipartMw = mixedMultipartMw;
