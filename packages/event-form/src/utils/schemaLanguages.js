const _ = require('lodash');
const ih = require('immutability-helper');
const validator = require('../validators/languages');

function getFromSchemaAndValues(
  schema,
  interfaceLanguage,
  valueLanguages = [],
) {
  const validatorOptions = _.first(schema.fields.filter((f) => f.field === 'languages')) || {};

  // if no default languages are set, interface language plays that role
  const validate = validator(
    validatorOptions.default
      ? validatorOptions
      : _.assign({}, validatorOptions, { default: [interfaceLanguage] }),
  );

  return validate(valueLanguages);
}

function setSchemaLanguages(
  schema,
  interfaceLanguage = null,
  valueLanguages = [],
) {
  const languages = getFromSchemaAndValues(
    schema,
    interfaceLanguage,
    valueLanguages,
  );

  const update = schema.fields.reduce(
    (result, field, index) =>
      (field.languages
        ? _.set(result, `fields.${index}`, { languages: { $set: languages } })
        : result),
    {},
  );

  return ih(schema, update);
}

module.exports = {
  set: setSchemaLanguages,
  getFromSchemaAndValues,
};
