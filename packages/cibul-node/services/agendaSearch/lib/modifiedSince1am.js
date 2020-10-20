'use strict';

const expressUtils = require('@openagenda/utils/express');

module.exports = (req, res, next) => {
  const today1am = new Date();

  today1am.setHours(1, 0, 0, 0);

  expressUtils.compareModifiedSince(today1am)(req, res, next);
}
