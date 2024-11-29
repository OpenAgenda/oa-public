import getFilters from './getFilters.js';
import getFilterTitle from './getFilterTitle.js';

function truncate(label, length) {
  if (label.length > length) {
    return `${label.substr(0, length)}…`;
  }
  return label;
}

function findMatchingField(schema, name) {
  const isSubField = name.split(':').length > 1;

  if (isSubField) {
    const [fieldName, subField] = name.split(':');
    return findMatchingField(
      schema.fields.find((f) => f.field === fieldName).schema,
      subField,
    );
  }

  return (schema?.fields ?? []).find((f) => f.field === name);
}

export default function getFilterSelectOptions(
  intl,
  schema = {},
  exclude = [],
) {
  return getFilters(intl, schema?.fields ?? [])
    .filter(({ name }) => !exclude.includes(name))
    .map(({ name }) => ({
      value: name,
      label: truncate(
        getFilterTitle(intl, null, name, findMatchingField(schema, name)),
        50,
      ),
    }));
}
