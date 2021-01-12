'use strict';

const _ = require('lodash');

module.exports = (k, nav, options = {}) => {
  const {
    after, offset, limit, order
  } = nav;

  const {
    useAfter
  } = options;

  if (useAfter) {
    k.where('id', '>', after);
  }

  if (offset) {
    k.offset(offset);
  }

  k.limit(limit);

  const [orderField, orderDirection] = order.split('.');

  k.orderBy(_.snakeCase(orderField), orderDirection);

  return orderField;
};
