'use strict';

module.exports = function foldLine(line) {
  let str = line;
  const parts = [];
  let length = 75;
  while (str.length > length) {
    parts.push(str.slice(0, length));
    str = str.slice(length);
    length = 74;
  }
  parts.push(str);
  return parts.join('\r\n ');
};
