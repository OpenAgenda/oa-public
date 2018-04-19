"use strict";

var _ = require('lodash'),
    contextValidator = require('../../iso/contextValidator');

module.exports = function (context, cb) {

  var cleanContext = void 0;

  try {

    cleanContext = contextValidator(context);
  } catch (e) {

    return cb(null, false, null, e);
  }

  return cb(null, true, cleanContext);
};
//# sourceMappingURL=validateContext.process.js.map