'use strict';

const _ = require('lodash');
const cn = require('classnames');

module.exports = (hbs, filterOrWidget) => ({ fn, hash, data }) => {
  if (typeof data.root.__filtersAndWidgetsCounter !== 'number') {
    data.root.__filtersAndWidgetsCounter = 0;
  }

  const i = data.root.__filtersAndWidgetsCounter;
  data.root.__filtersAndWidgetsCounter += 1;

  const {
    tagName = 'div',
    className = '',
    attributes = '',
    activeClass = 'active',
    inactiveClass = 'inactive',
    ...restOptions
  } = hash;

  const attrs = {
    aggregation: null,
    type: filterOrWidget === 'filter' ? 'custom' : undefined,
    activeClass,
    inactiveClass,
    ...restOptions
  };

  const statusClass = attrs.query && _.isMatch(_.omitBy(data.root.query, _.isEmpty), _.omitBy(attrs.query, _.isEmpty))
    ? activeClass
    : inactiveClass;

  if (data.root.__extractFiltersAndWidgets) {
    data.root[`${filterOrWidget}s`].push(attrs);
  }

  return new hbs.SafeString(`
    <${tagName}
      ${attributes}
      class="${cn(className, !attrs.activeTargetSelector ? statusClass : '')}"
      data-oa-${filterOrWidget}="${i}"
      data-oa-${filterOrWidget}-params="${hbs.Utils.escapeExpression(JSON.stringify(attrs))}"
    >
      ${fn(this)}
    </${tagName}>
  `);
};
