'use strict';

const _ = require('lodash');
const cn = require('classnames');

module.exports = hbs => ({ fn, hash, data }) => {
  if (typeof data.root.__filtersAndWidgetsCounter !== 'number') {
    data.root.__filtersAndWidgetsCounter = 0;
  }

  const i = data.root.__filtersAndWidgetsCounter;
  data.root.__filtersAndWidgetsCounter += 1;

  const {
    tagName = 'div',
    className = '',
    attributes = '',
    query = {},
    activeClass = 'active',
    inactiveClass = 'inactive',
    ...restOptions
  } = hash;

  const attrs = {
    aggregation: null,
    type: 'custom',
    query,
    activeClass,
    inactiveClass,
    ...restOptions
  };

  const statusClass = _.isMatch(_.omitBy(data.root.query, _.isEmpty), _.omitBy(query, _.isEmpty))
    ? activeClass
    : inactiveClass;

  if (data.root.__extractFiltersAndWidgets) {
    data.root.filters.push(attrs);
  }

  return new hbs.SafeString(`
    <${tagName}
      ${attributes}
      class="${cn(className, statusClass)}"
      data-oa-filter="${i}"
      data-oa-filter-params="${hbs.Utils.escapeExpression(JSON.stringify(attrs))}"
    >
      ${fn(this)}
    </${tagName}>
  `);
};
