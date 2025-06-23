import {
  languages_default
} from "./chunk-V6VOOY44.js";

// src/utils/schemaLanguages.js
import _ from "lodash";
import ih from "immutability-helper";
function getFromSchemaAndValues(schema, interfaceLanguage, valueLanguages = []) {
  const validatorOptions = _.first(schema.fields.filter((f) => f.field === "languages")) || {};
  const validate = languages_default(
    validatorOptions.default ? validatorOptions : _.assign({}, validatorOptions, { default: [interfaceLanguage] })
  );
  return validate(valueLanguages);
}
function setSchemaLanguages(schema, interfaceLanguage = null, valueLanguages = []) {
  const languages = getFromSchemaAndValues(
    schema,
    interfaceLanguage,
    valueLanguages
  );
  const update = schema.fields.reduce(
    (result, field, index) => field.languages ? _.set(result, `fields.${index}`, { languages: { $set: languages } }) : result,
    {}
  );
  return ih(schema, update);
}
var schemaLanguages_default = {
  set: setSchemaLanguages,
  getFromSchemaAndValues
};

export {
  schemaLanguages_default
};
//# sourceMappingURL=chunk-AXBOSLHH.js.map