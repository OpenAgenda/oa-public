'use strict';

module.exports = accessibility => {
  const accessibilityArray = [];
  for (const code in accessibility) {
    if (accessibility[code] === true) {
      accessibilityArray.push(code);
    }
  }
  return accessibilityArray;
};
