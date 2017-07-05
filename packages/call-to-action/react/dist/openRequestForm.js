'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = openRequestForm;
var onReady = exports.onReady = void 0;

function openRequestForm(event) {
  if (typeof window !== 'undefined' && window.openRequestForm) {
    window.openRequestForm(event);
  } else {
    exports.onReady = onReady = event;
  }
};