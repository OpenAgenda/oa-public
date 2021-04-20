"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = Switch;

_Object$defineProperty(exports, "Case", {
  enumerable: true,
  get: function get() {
    return _Case.default;
  }
});

var _find = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/find"));

var _Case = _interopRequireDefault(require("./Case"));

/*
 * <Switch test={someTest}>
 *   <Case value={1}>
 *     Value 1
 *   </Case>
 *   <Case value={2}>
 *     Value 2
 *   </Case>
 * </Switch>
 * */
function Switch(_ref) {
  var test = _ref.test,
      children = _ref.children;
  return (0, _find.default)(children).call(children, function (child) {
    return child.props.value === test;
  });
}

Switch.Case = _Case.default;
module.exports = exports.default;
//# sourceMappingURL=Switch.js.map