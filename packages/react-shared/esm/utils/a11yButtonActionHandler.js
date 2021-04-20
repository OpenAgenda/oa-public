import _concatInstanceProperty from "@babel/runtime-corejs3/core-js/instance/concat";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import _typeof from "@babel/runtime-corejs3/helpers/typeof";
export default function a11yButtonActionHandler(fn) {
  if (typeof fn !== 'function') {
    throw new Error("@a11yButtonActionHandler decorator can only be applied to function, not '".concat(_typeof(fn), "'"));
  }

  return function actionHandler() {
    var _context, _context2;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var event = args[0];

    if (!event || event.type === 'click' || _includesInstanceProperty(_context = ['keydown', 'keypress']).call(_context, event.type) && _includesInstanceProperty(_context2 = ['Enter', ' ']).call(_context2, event.key)) {
      var _context3;

      fn.call.apply(fn, _concatInstanceProperty(_context3 = [this]).call(_context3, args));
    }
  };
}
//# sourceMappingURL=a11yButtonActionHandler.js.map