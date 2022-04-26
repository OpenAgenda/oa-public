'use strict';

function replaceAccentsFromString(str) {
  return str.normalize('NFC').replace(/[\u0300-\u036f]/, '');
}

module.exports = function replaceAccents(objOrString) {
  if (typeof objOrString === 'string') {
    return replaceAccentsFromString(objOrString);
  }

  if (objOrString instanceof Object) {
    return Object.keys(objOrString).reduce((formatted, key) => Object.assign(
      formatted,
      { [key]: replaceAccents(objOrString[key]) }
    ), {});
  }

  return objOrString;
};
