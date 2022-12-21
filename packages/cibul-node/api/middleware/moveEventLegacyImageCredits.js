'use strict';

module.exports = (req, res, next) => {
  if (!req.parsedData?.image?.credits) {
    return next();
  }
  if (req.parsedData.imageCredits) {
    return next();
  }

  req.parsedData.imageCredits = req.parsedData.image.credits;

  next();
};
