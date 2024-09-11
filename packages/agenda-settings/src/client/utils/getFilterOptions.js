import { getFilters, getFilterTitle } from '@openagenda/react-filters';

const truncate = (label, length) => {
  if (label.length > length) {
    return `${label.substr(0, length)}...`;
  }
  return label;
};

const findMatchingField = (schema, name) => {
  const isSubField = name.split(':').length > 1;

  if (isSubField) {
    const [fieldName, subField] = name.split(':');
    return findMatchingField(
      schema.fields.find((f) => f.field === fieldName).schema,
      subField,
    );
  }

  return (schema?.fields ?? []).find((f) => f.field === name);
};

export default function getFilterOptions(intl, schema = {}, exclude = []) {
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
