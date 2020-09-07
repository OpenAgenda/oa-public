'use strict';

const cleanNav = require('./cleanNav');

module.exports = (k, nav) => {
  const {
    after, offset, limit
  } = cleanNav(nav);

  if (after) {
    k.where('id', '<', after)
  }

  k.orderBy('id', 'desc');

  if (offset) {
    k.offset(offset);
  }

  k.limit(limit);
};
