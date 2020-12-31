'use strict';

module.exports = (k, nav) => {
  const {
    after, offset, limit, useAfter
  } = nav;

  if (useAfter) {
    k.where('id', '>', after)
  }

  if (offset) {
    k.offset(offset);
  }

  k.limit(limit);
};
