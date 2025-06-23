'use strict';

var _objectSpread = require("@babel/runtime-corejs3/helpers/objectSpread2").default;
module.exports = function (type) {
  let values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  let defaults = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const params = _objectSpread(_objectSpread({
    type,
    list: false,
    field: undefined,
    allowNull: false,
    optional: true
  }, defaults), values);
  if (values.optional === undefined) {
    params.optional = true;
  }
  return params;
};
//# sourceMappingURL=params.js.map