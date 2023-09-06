'use strict';

module.exports = (arr, compare) => arr
  .map((item, index) => ({ item, index }))
  .sort((a, b) => compare(a.item, b.item) || a.index - b.index)
  .map(({ item }) => item);
