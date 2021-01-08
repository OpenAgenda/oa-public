'use strict';

module.exports = (k, nav) => {
  const { after, offset, limit } = nav;

  if (after) {
    k.where('id', '<', after);
  }

  if (offset) {
    k.offset(offset);
  }

  k.limit(limit);
};
