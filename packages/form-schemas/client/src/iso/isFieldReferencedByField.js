import getWithFieldName from './getWithFieldName.js';

export default function isFieldReferencedByField(field, byField) {
  const references = []
    .concat(getWithFieldName(byField.optionalWith))
    .concat(getWithFieldName(byField.enableWith))
    .concat(
      Object.keys(byField.related ?? {}).reduce(
        (related, key) => related.concat(byField.related[key]),
        [],
      ),
    );

  return references.includes(field.field);
}
