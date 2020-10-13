'use strict';

const fs = require('fs');
const os = require('os');
const { join } = require('path');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const processFile = require('./processFile');

function getFilename(req, file, cb) {
  crypto.randomBytes(16, (err, raw) => {
    cb(err, err ? undefined : raw.toString('hex'));
  });
}

function getDestination(req, file, cb) {
  cb(null, os.tmpdir());
}

class TempStorage {
  constructor({
    cfg, providers, options, tmpFilename, tmpDestination
  }) {
    this.cfg = cfg;
    this.providers = providers;
    this.options = options;

    this.getFilename = (tmpFilename || getFilename);

    if (typeof tmpDestination === 'string') {
      mkdirp.sync(tmpDestination);
      this.getDestination = ($0, $1, cb) => {
        cb(null, tmpDestination);
      };
    } else {
      this.getDestination = (tmpDestination || getDestination);
    }
  }

  transformAndUpload(file, context) {
    const options = Array.isArray(this.options) ? this.options : [this.options];
    const fileOptions = options.find(option => option.key === file.fieldname);

    if (!fileOptions) {
      throw new Error(`Unable to find options for file '${file.fieldname}'`);
    }

    return processFile(this.cfg, this.providers, file, fileOptions, context);
  }

  _handleFile(req, file, cb) {
    const that = this;

    that.getDestination(req, file, (err, destination) => {
      if (err) return cb(err);

      that.getFilename(req, file, (err2, filename) => {
        if (err2) return cb(err2);

        const finalPath = join(destination, filename);
        const outStream = fs.createWriteStream(finalPath);

        file.stream.pipe(outStream);
        outStream.on('error', cb);
        outStream.on('finish', () => {
          Object.assign(file, {
            transformAndUpload: this.transformAndUpload.bind(this, file),
            destination,
            filename,
            path: finalPath,
            size: outStream.bytesWritten
          });

          cb();
        });
      });
    });
  }

  // eslint-disable-next-line class-methods-use-this
  _removeFile(req, file, cb) {
    const { path } = file;

    delete file.destination;
    delete file.filename;
    delete file.path;

    fs.unlink(path, cb);
  }
}

module.exports = TempStorage;
