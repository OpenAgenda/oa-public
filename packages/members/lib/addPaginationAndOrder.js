'use strict';

const _ = require('lodash');
const roleValues = require('../iso/roleValues');
const cleanNav = require('./cleanNav');

const rolesOrder = roleValues.map(v => v.code);

function _isMonoFieldSeek(after) {
  return _.isArray(after) && after.length === 1;
}

function _isMultiFieldSeek(after) {
  return _.isArray(after) && after.length === 2;
}

function _operator(direction, reverse = false) {
  if (!reverse) {
    return direction === 'desc' ? '<=' : '>=';
  }
  return direction === 'desc' ? '>=' : '<=';
}

function orderBy(k, after, column, orderDirection) {
  if (column === 'credential') {
    const rolesOrdered = orderDirection === 'ASC' ? rolesOrder.reverse() : rolesOrder;

    if (_isMultiFieldSeek(after)) {
      k.orderByRaw(`field(\`${column}\`,${rolesOrdered.join(',')})`);
      k.orderBy({
        column: 'id',
        order: 'asc'
      });
    } else {
      k.orderByRaw(`field(\`${column}\`,${rolesOrdered.join(',')})`);
    }
  } else if (_isMultiFieldSeek(after)) {
    k.orderBy([
      {
        column,
        order: orderDirection
      },
      {
        column: 'id',
        order: 'asc'
      }
    ]);
  } else {
    k.orderBy(column, orderDirection);
  }
}

module.exports = (k, nav) => {
  const {
    after, offset, limit, page, order
  } = cleanNav(nav);

  const [orderField, orderDirection] = order.split('.');
  let column = _.snakeCase(orderField);

  if (column === 'role') {
    column = 'credential';
  }

  if (_isMonoFieldSeek(after)) {
    k.where('id', '>', after);
  } else if (_isMultiFieldSeek(after)) {
    k.where(builder => builder
      .where(column, _operator(orderDirection), after[0] || 0)
      .whereRaw(
        `not (${column} = ? and id ${_operator('desc')} ?)`,
        after || 0
      ));
  } else if (offset) {
    k.offset(offset);
  } else if (page) {
    k.offset((page - 1) * limit);
  }

  orderBy(k, after, column, orderDirection);

  k.limit(limit);

  return {
    orderField
  };
};
