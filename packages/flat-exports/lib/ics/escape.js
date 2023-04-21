'use strict';

module.exports = txt => {
  if (txt === null) return null;

  return `${txt}`
    .replace(/\\/gm, '\\\\')
    .replace(/\r?\n/gm, '\\n')
    .replace(/;/gm, '\\;')
    .replace(/,/gm, '\\,');
}
