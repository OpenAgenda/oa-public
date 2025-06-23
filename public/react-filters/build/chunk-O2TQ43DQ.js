import {
  getFilterTitle
} from "./chunk-SB23MYX5.js";
import {
  getFilters
} from "./chunk-OCSZ7TMG.js";

// src/utils/getFilterSelectOptions.js
function truncate(label, length) {
  if (label.length > length) {
    return `${label.substr(0, length)}\u2026`;
  }
  return label;
}
function findMatchingField(schema, name) {
  const isSubField = name.split(":").length > 1;
  if (isSubField) {
    const [fieldName, subField] = name.split(":");
    return findMatchingField(
      schema.fields.find((f) => f.field === fieldName).schema,
      subField
    );
  }
  return ((schema == null ? void 0 : schema.fields) ?? []).find((f) => f.field === name);
}
function getFilterSelectOptions(intl, schema = {}, exclude = []) {
  return getFilters(intl, (schema == null ? void 0 : schema.fields) ?? []).filter(({ name }) => !exclude.includes(name)).map(({ name }) => ({
    value: name,
    label: truncate(
      getFilterTitle(intl, null, name, findMatchingField(schema, name)),
      50
    )
  }));
}

export {
  getFilterSelectOptions
};
//# sourceMappingURL=chunk-O2TQ43DQ.js.map