"use strict";

var du = require('@openagenda/dom-utils');

module.exports = function (selector, cb) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return; // server!

  var formElem = du.el(selector),
      inputElem = du.el(formElem, 'input');
  if (!formElem || !inputElem) return;
  du.addEvent(formElem, 'submit', function (e) {
    e.preventDefault();
    cb(inputElem.value);
  });
};
//# sourceMappingURL=monitorField.js.map