'use strict';

const counters = require('./utils/counters');

function getFieldSchema(agendaSchema, fieldName) {
  return agendaSchema.fields.find((v) => v.field === fieldName);
}

module.exports = (hbs) =>
  ({ hash, data }) => {
    counters.init(data);

    const {
      tagName = 'div',
      className = '',
      attributes = '',
      name,
      ...restOptions
    } = hash;

    const fieldSchema = getFieldSchema(data.root.agenda.schema, name);

    const attrs = {
      ...restOptions,
      name,
    };

    if (fieldSchema?.schemaId) {
      attrs.fieldSchema = fieldSchema;
    }

    const i = counters.increment(data, 'filters', name);

    if (data.root.__extractFiltersAndWidgets) {
      data.root.filters.push({
        ...attrs,
        destSelector: `[data-oa-filter="${name}-${i}"][data-oa-filter-params="${JSON.stringify(
          attrs,
        ).replace(/["\\]/g, '\\$&')}"]`,
      });
    }

    return new hbs.SafeString(`
    <${tagName}
      ${attributes}
      ${className ? `class="${className}"` : ''}
      data-oa-filter="${name}-${i}"
      data-oa-filter-params="${hbs.Utils.escapeExpression(JSON.stringify(attrs))}"
    ></${tagName}>
  `);
  };
