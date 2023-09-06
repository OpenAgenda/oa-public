'use strict';

module.exports = str => {
  if (typeof str !== 'string') return str;

  const charsToClean = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    11, // VT
    18, // DC2
    19, // DC3
    21, // NAK
    26, // SUB
    30, // RS
    31, // Information separator
    8232,
    8233,
    769, // U+0301
  ];

  for (let i = 0; i < charsToClean.length; i++) {
    charsToClean[i] = String.fromCharCode(charsToClean[i]);
  }

  return str.replace(new RegExp(`[${charsToClean.join('')}]`, 'g'), ' ');
};
