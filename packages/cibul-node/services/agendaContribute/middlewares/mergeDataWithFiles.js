'use strict';

module.exports = function mergeDataWithFiles(req, res, next) {
  req.dataWithFiles = {
    ...(req.body.data ? JSON.parse(req.body.data) : {}),
    ...(req.fileFieldValues ?? {})
  };

  next();
};
