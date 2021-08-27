'use strict';

function getFieldSchema(agendaSchema, fieldName) {
  return agendaSchema.fields.find(v => v.field === fieldName);
}

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

  const fieldSchema = getFieldSchema(data.root.agenda.schema, name);

  const attrs = {
    ...restOptions,
    name,
    destSelector: `[data-oa-filter="${i}"]`
  };

  if (fieldSchema?.schemaId) {
    attrs.fieldSchema = fieldSchema;
  }

  if (data.root.__extractFiltersAndWidgets) {
    data.root.filters.push(attrs);
  }

  return new hbs.SafeString(`
    <${tagName}
      ${attributes}
      class="${className}"
      data-oa-filter="${i}"
      data-oa-filter-params="${hbs.Utils.escapeExpression(JSON.stringify(attrs))}"
    ></${tagName}>
  `);
};
