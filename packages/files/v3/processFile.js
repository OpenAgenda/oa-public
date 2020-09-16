'use strict';

const { PassThrough } = require('stream');
const FileType = require('file-type');
const VError = require('verror');

const imageExts = new Set([
  'jpg',
  'png',
  'gif',
  'webp',
  'flif',
  'cr2',
  'tif',
  'bmp',
  'jxr',
  'psd',
  'ico',
  'bpg',
  'jp2',
  'jpm',
  'jpx',
  'heic',
  'cur',
  'dcm'
]);

async function getStreamInfo(data) {
  const stream = await FileType.stream(data);
  const fileType = stream.fileType;
  const isImage = imageExts.has(fileType && fileType.ext);

  stream.isImage = isImage;

  return {
    stream,
    fileType,
    isImage
  };
}

function extractStreamAndContext(data) {
  const hasFileContext = Array.isArray(data);

  const stream = hasFileContext ? data[0] : data
  const context = hasFileContext ? data[1] : {};

  return [stream, context];
}

function getFileVariants(options) {
  const { key, variants, ...restOptions } = options;

  // Only one variant
  if (!Array.isArray(variants)) {
    return [
      {
        key,
        ...restOptions
      }
    ];
  }

  // Multiple variants
  const result = [];

  for (const variant of variants) {
    result.push({
      key,
      ...restOptions,
      ...variant
    });
  }

  return result;
}

function abortUpload(item) {
  // Destroy stream for current upload
  item.stream.destroy();

  // Revert upload for finished upload
  if (item.uploadValue) {
    return item.revert();
  }

  // Nothing to do for erroneous uploads
  return true;
}

function abortAllVariants(registry) {
  const promises = [];

  for (const [, item] of registry) {
    promises.push(item.abort());
  }

  return Promise.all(promises);
}

module.exports = async function processFile(cfg, providers, data, options, context, returnRegistry) {
  // Get file's stream and context
  const [fileStream, fileContext] = extractStreamAndContext(data);

  // Detect type
  const info = await getStreamInfo(fileStream, options);

  // Make context
  const ctx = {
    originalname: fileStream.path,
    ...context,
    ...fileContext
  };

  const variants = getFileVariants(options);
  const providerKey = options.provider || cfg.defaultProvider;
  const provider = providers[providerKey];

  if (!provider) {
    throw new Error(`Provider '${providerKey}' is not configured or does not exist`);
  }

  const promises = [];
  const variantsRegistry = new Map();

  for (const variant of variants) {
    const variantStream = info.stream.pipe(new PassThrough());

    const response = {
      ...info,
      key: variant.key,
      stream: variantStream,
      provider: providerKey,
      revert: () => provider.remove(response.filename),
      abort: () => abortUpload(response)
    };

    variantsRegistry.set(variant, response);

    // Start upload
    promises.push(
      Promise.resolve()
        .then(async () => {
          response.filename = await variant.getFilename(response, ctx);

          if (typeof variant.transform === 'function') {
            response.stream = await variant.transform(response, ctx);
          }

          return provider.upload(response.stream, response.filename);
        })
        .then(result => {
          response.uploadValue = result;

          return response;
        })
        .catch(error => {
          response.uploadReason = error;

          throw new VError({
            cause: error,
            info: response
          });
        })
    );
  }

  const ret = !Array.isArray(options.variants)
    ? promises[0]
    : Promise.all(promises);

  if (returnRegistry) {
    return {
      promise: ret,
      registry: variantsRegistry
    };
  }

  return ret
    .catch(async error => {
      await abortAllVariants(variantsRegistry);

      throw error;
    });
};
