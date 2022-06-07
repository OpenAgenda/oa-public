'use strict';

module.exports = (k, nav, options = {}) => {
  const {
    after, offset, limit, order
  } = nav;

  const {
    stream: streamOptions
  } = options;

  const orderParts = order.split('.');

  if (after && orderParts[0] === 'createdAt') {
    k.where('id', orderParts[0] === 'asc' ? '>' : '<', after);
  } else if (after && orderParts[0] === 'name') {
    k.where('placename', orderParts[0] === 'asc' ? '<' : '>', after[0]);
    k.where('id', '>', after[1]);
  }

  if (!streamOptions) {
    if (offset) {
      k.offset(offset);
    }

    k.limit(limit);
  }

  if (orderParts[0] === 'createdAt') {
    k.orderBy('id', orderParts[1]);
  } else if (orderParts[0] === 'name') {
    k.orderBy('placename', orderParts[1]);
  }
};
