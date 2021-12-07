'use strict';

module.exports = function mergeDataWithFiles(req, res, next) {
  req.dataWithFiles = {
    ...JSON.parse(req.body.data),
    ...(req.fileFieldValues ?? {})
  };

  next();
};
