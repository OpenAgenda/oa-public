import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import extractSchemaLabelLanguages from './extractSchemaLabelLanguages.js';
const labelKeys = ['label', 'info', 'placeholder', 'sub'];
function flattenItem(item, languages) {
  const monolingualized = _reduceInstanceProperty(labelKeys).call(labelKeys, (flat, key) => {
    if (typeof flat[key] === 'string' || !flat[key]) {
      return flat;
    }
    for (const candidate of languages) {
      if (flat[key][candidate]) {
        return _objectSpread(_objectSpread({}, flat), {}, {
          [key]: flat[key][candidate]
        });
      }
    }
    return flat;
  }, item);
  if (monolingualized.options) {
    monolingualized.options = monolingualized.options.map(o => flattenItem(o, languages));
  }
  return monolingualized;
}
export default function monolingualizeSchema(schema) {
  const languages = extractSchemaLabelLanguages(schema);
  return _objectSpread(_objectSpread({}, schema), {}, {
    fields: schema.fields.map(field => flattenItem(field, languages))
  });
}
//# sourceMappingURL=monolingualizeSchema.js.map