'use strict';

module.exports = hbs => ({ hash, data }) => {
  if (typeof data.root.__filtersAndWidgetsCounter !== 'number') {
    data.root.__filtersAndWidgetsCounter = 0;
  }

  const i = data.root.__filtersAndWidgetsCounter;
  data.root.__filtersAndWidgetsCounter += 1;

  const {
    tagName = 'div',
    className = '',
    attributes = '',
    name,
    ...restOptions
  } = hash;

  const attrs = {
    ...restOptions,
    name,
    destSelector: `[data-oa-widget="${i}"]`
  };

  if (data.root.__extractFiltersAndWidgets) {
    data.root.widgets.push(attrs);
  }

  return new hbs.SafeString(`
    <${tagName}
      ${className ? `class="${className}"` : ''}
      ${attributes}
      data-oa-widget="${i}"
      data-oa-widget-params="${hbs.Utils.escapeExpression(JSON.stringify(attrs))}"
    ></${tagName}>
  `);
};