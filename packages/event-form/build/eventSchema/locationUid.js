"use strict";

var integer = require('@openagenda/validators/integer');

module.exports = function () {
  return integer({
    field: 'locationUid',
    max: 99999999,
    min: 1
  });
};
//# sourceMappingURL=locationUid.js.map