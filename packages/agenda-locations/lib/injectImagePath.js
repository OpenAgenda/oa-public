'use strict';

module.exports = (items, path) => items.map(i => {
  if (i.image) {
    i.image = path + i.image;
  }
  return i;
});
