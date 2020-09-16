'use strict';

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

module.exports = async function processFile(cfg, providers, data, options, context) {
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

  for (const variant of variants) {
    const { key, getFilename, transform, ...variantRest } = variant;

    let stream = info.stream;
    let filename;

    // Start upload
    promises.push(
      Promise.resolve()
        .then(async () => {
          filename = await variant.getFilename(info, ctx);

          if (typeof variant.transform === 'function') {
            stream = await variant.transform(info, ctx);
          }

          return provider.upload(stream, filename, variantRest);
        })
        .then(result => ({
          ...info,
          key,
          filename,
          provider: providerKey,
          ...variantRest,
          uploadValue: result
        }))
        .catch(error => {
          throw new VError({
            cause: error,
            info: {
              ...info,
              key,
              filename,
              provider: providerKey,
              ...variantRest
            }
          });
        })
    );
  }

  if (!Array.isArray(options.variants)) {
    return promises[0]
      .catch(error => {
        // TODO abort and/or remove all others
        console.log('CA PLANTE, on destroy tout', error);
        throw error;
      });
  }

  return Promise.all(promises)
    .catch(error => {
      // TODO abort and/or remove all others
      console.log('CA PLANTE, on destroy tout', error);

      console.log(promises);

      throw error;
    });
};
