'use strict';

module.exports = keywords => {
  if (!keywords || (keywords && !Object.keys(keywords).length)) return null;

  return keywords;
};
