import snakeCase from 'lodash/snakeCase.js';

export default (k, nav, options = {}) => {
  const { after, offset, limit, order } = nav;
  const { useAfter } = options;

  if (useAfter) {
    k.where('id', '>', after);
  }

  if (offset) {
    k.offset(offset);
  }

  k.limit(limit);

  const [orderField, orderDirection] = order.split('.');

  k.orderBy(snakeCase(orderField), orderDirection).orderBy('id', 'desc');

  return orderField;
};
