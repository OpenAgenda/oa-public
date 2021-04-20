"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.unset = unset;
exports.set = set;

function preventUnload(e) {
  e.preventDefault();
  e.returnValue = '';
}

function unset() {
  if (!window) return;
  window.removeEventListener('beforeunload', preventUnload);
}

function set() {
  if (!window) return;
  unset(); // in case listener was already loaded

  window.addEventListener('beforeunload', preventUnload);
}
//# sourceMappingURL=unloadWarning.js.map