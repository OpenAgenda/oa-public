import getFormSchemaAdditionalFields from './getFormSchemaAdditionalFields.js';
import adminLevelSwap from './adminLevelSwap.js';

function _keepHigherOrderIncludes(includes = []) {
  const higherOrderIncludes = includes.filter((i) => !i.includes('.'));

  return includes.filter((include) => {
    if (higherOrderIncludes.includes(include)) {
      return true;
    }
    return !higherOrderIncludes.includes(include.split('.').shift());
  });
}

export default (
  { baseSearchIncludes, detailedSearchIncludes, otherStandardFields },
  { detailed, formSchema, access, requested: dirtyRequested },
) => {
  const requested = dirtyRequested
    ? adminLevelSwap.apply(dirtyRequested)
    : dirtyRequested;

  const additionalFields = formSchema
    ? getFormSchemaAdditionalFields(formSchema).map((f) => f.field)
    : [];
  const knownFields = baseSearchIncludes
    .concat(detailedSearchIncludes)
    .concat(additionalFields)
    .concat(otherStandardFields);

  const includes = []
    .concat(!requested ? baseSearchIncludes : [])
    .concat(!requested && detailed ? detailedSearchIncludes : [])
    .concat(requested || [])
    .concat(requested ? [] : additionalFields)
    .map((field) => ({
      field,
      higherOrderField: field.split('.').shift(),
      keep: knownFields.includes(field) ? field : null,
    }))
    .map(({ higherOrderField, keep }) => {
      if (!requested || keep) {
        return keep;
      }

      if (knownFields.includes(higherOrderField)) {
        return higherOrderField;
      }

      return null;
    })
    .filter((field) => !!field);

  if (includes.includes('nextTiming')) {
    includes.push('timings');
  }

  if (!access || !formSchema) {
    return _keepHigherOrderIncludes(includes);
  }

  return _keepHigherOrderIncludes(
    includes.filter((fieldName) => {
      const formSchemaField = formSchema.fields
        .filter((f) => f.field === fieldName)
        .pop();

      if (
        !formSchemaField
        && (baseSearchIncludes.includes(fieldName)
          || detailedSearchIncludes.includes(fieldName))
      ) {
        return true;
      }
      return (
        !formSchemaField
        || !formSchemaField.read
        || formSchemaField.read.includes(access)
      );
    }),
  );
};
