'use strict';

const processFile = require('./processFile');

module.exports = class StreamStorage {
  constructor(cfg, providers, options) {
    this.cfg = cfg;
    this.providers = providers;
    this.options = options;
  }

  transformAndUpload(file, context) {
    const options = Array.isArray(this.options) ? this.options : [this.options];
    const fileOptions = options.find(option => option.key === file.fieldname);

    if (!fileOptions) {
      throw new Error(`Unable to find options for file '${file.fieldname}'`);
    }

    const {
      fieldname,
      originalname,
      encoding,
      mimetype
    } = file;

    const newContext = {
      fieldname,
      originalname,
      encoding,
      mimetype,
      ...context
    };

    return processFile(this.cfg, this.providers, file.stream, fileOptions, newContext);
  }

  _handleFile(req, file, cb) {
    // For next calling by busboy
    file.stream.emit('end');

    // stream is already in file
    cb(null, {
      transformAndUpload : this.transformAndUpload.bind(this, file)
    });
  }

  _removeFile(req, file, cb) {
    cb(null);
  }
};
