'use strict';

const fs = require('fs');

function _cleanup(file) {
  if (Array.isArray(file)) {
    return file.forEach(f => _cleanup(f));
  }

  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
}

module.exports = function createCleanupMw() {
  return function cleanupMw(req, res, next) {
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
};
