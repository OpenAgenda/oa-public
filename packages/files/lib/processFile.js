'use strict';

const fs = require('fs');
const { PassThrough } = require('stream');
const FileType = require('file-type');
const isStream = require('is-stream');
const VError = require('@openagenda/verror');

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
  'dcm',
]);

async function getStreamInfo(data) {
  const stream = await FileType.stream(data);
  const { fileType } = stream;
  const isImage = imageExts.has(fileType && fileType.ext);

  stream.isImage = isImage;

  return {
    stream,
    fileType,
    isImage,
  };
}

function extractStreamAndContext(data) {
  const hasFileContext = Array.isArray(data);

  const file = hasFileContext ? data[0] : data;
  const fileContext = hasFileContext ? data[1] : {};

  // from multer
  if (!isStream(file) && file.path) {
    const stream = fs.createReadStream(file.path);
    const {
      fieldname, originalname, encoding, mimetype
    } = file;

    const context = {
      fieldname,
      originalname,
      encoding,
      mimetype,
      ...fileContext,
    };

    return [stream, context];
  }

  return [file, fileContext];
}

function getFileVariants(options) {
  const { key, variants, ...restOptions } = options;

  // Only one variant
  if (!Array.isArray(variants)) {
    return [
      {
        key,
        ...restOptions,
      },
    ];
  }

  // Multiple variants
  const result = [];

  for (const variant of variants) {
    result.push({
      key,
      ...restOptions,
      ...variant,
    });
  }

  return result;
}

function abortUpload(item, error) {
  // Destroy stream for current upload
  if (item.stream) {
    item.stream.destroy(error);
  }

  // Revert upload
  if (!item.existedBefore) {
    return item.revert();
  }
}

function abortAllVariants(registry, error) {
  const promises = [];

  for (const [, item] of registry) {
    promises.push(item.abort(error));
  }

  return Promise.all(promises);
}

module.exports = async function processFile(
  cfg,
  providers,
  data,
  options,
  context,
  returnRegistry
) {
  // Get file's stream and context
  const [fileStream, fileContext] = extractStreamAndContext(data);

  // Detect type
  const info = await getStreamInfo(fileStream, options);

  const variants = getFileVariants(options);
  const providerKey = options.provider || cfg.defaultProvider;
  const provider = providers[providerKey];

  if (!provider) {
    throw new Error(
      `Provider '${providerKey}' is not configured or does not exist`
    );
  }

  const promises = [];
  const variantsRegistry = new Map();

  for (const variant of variants) {
    const pass = new PassThrough();

    const ctx = {
      originalname: fileStream.path,
      providerParams: {
        ContentType:
          typeof variant.transform === 'function'
            ? 'application/octet-stream'
            : info.fileType.mime || context.mimetype,
      },
      ...context,
      ...fileContext,
    };

    const response = {
      ...info,
      key: variant.key,
      provider: providerKey,
      revert: () => provider.remove(response.filename),
      abort: error => abortUpload(response, error),
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

          const variantStream = response.stream.pipe(pass);

          response.existedBefore = await provider.exists(response.filename);

          const managedUpload = provider.upload(
            variantStream,
            response.filename,
            ctx.providerParams
          );

          response.abort = error => {
            managedUpload.abort();
            return abortUpload(response, error);
          };

          return managedUpload.promise();
        })
        .then(result => {
          response.uploadStatus = 'fulfilled';
          response.uploadValue = result;

          return response;
        })
        .catch(error => {
          response.uploadStatus = 'rejected';
          response.uploadReason = error;

          throw new VError({
            cause: error,
            info: response,
          });
        })
        .finally(() => {
          pass.destroy();
        })
    );
  }

  const ret = (!Array.isArray(options.variants)
    ? promises[0]
    : Promise.all(promises)
  ).finally(() => {
    info.stream.destroy();
    fileStream.destroy();
  });

  if (returnRegistry) {
    return {
      promise: ret,
      registry: variantsRegistry,
    };
  }

  return ret.catch(async error => {
    await abortAllVariants(variantsRegistry, error);

    throw error;
  });
};
