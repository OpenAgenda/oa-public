var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/getAdditionalFilters.js
var getAdditionalFilters_exports = {};
__export(getAdditionalFilters_exports, {
  default: () => getAdditionalFilters
});
module.exports = __toCommonJS(getAdditionalFilters_exports);
var isAdditionalField = (field) => field.schemaId && [
  "checkbox",
  "radio",
  "multiselect",
  "boolean",
  "select",
  "number",
  "integer"
].includes(field.fieldType);
var getFieldPath = (field, path = "") => path.length ? `${path}:${field.slug ?? field.field}` : field.slug ?? field.field;
function getAdditionalFilters(fields, path = "") {
  return fields.reduce((additionalFilters, field) => {
    const fieldPath = getFieldPath(field, path);
    if (field.schema) {
      return additionalFilters.concat(
        getAdditionalFilters(field.schema.fields, fieldPath)
      );
    }
    if (!isAdditionalField(field)) {
      return additionalFilters;
    }
    additionalFilters.push({
      name: fieldPath,
      fieldSchema: {
        ...field,
        field: fieldPath
      }
    });
    return additionalFilters;
  }, []);
}
//# sourceMappingURL=getAdditionalFilters.cjs.map