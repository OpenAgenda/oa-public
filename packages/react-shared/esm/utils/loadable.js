import _bindInstanceProperty from "@babel/runtime-corejs3/core-js/instance/bind";
import loadable from '@loadable/component'; // Wrapper with a working load method

export default (function (fn, options) {
  var _context, _context2;

  var Component = loadable(fn, options);
  Component.load = _bindInstanceProperty(_context = fn.requireAsync || fn).call(_context, fn);
  Component.isReady = fn.isReady ? _bindInstanceProperty(_context2 = fn.isReady).call(_context2, fn) : function () {
    return false;
  };
  return Component;
});
//# sourceMappingURL=loadable.js.map