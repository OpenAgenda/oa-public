import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import ih from 'immutability-helper';
import labelKeys from './labelKeys.js';
function extractFillerLabel(label, languages) {
  if (languages.length) {
    return label[languages[0]];
  }
  if (typeof label === 'string') {
    return label;
  }
}
function restrictLabelLanguages(field) {
  var _context;
  let languages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  const restricted = ih(field !== null && field !== void 0 ? field : {}, _reduceInstanceProperty(_context = labelKeys.filter(labelKey => field === null || field === void 0 ? void 0 : field[labelKey])).call(_context, (updates, labelKey) => {
    const currentLabelLanguages = typeof field[labelKey] === 'string' ? [] : Object.keys(field[labelKey]);
    const fillerLabel = extractFillerLabel(field[labelKey], currentLabelLanguages);
    return _objectSpread(_objectSpread({}, updates), {}, {
      [labelKey]: {
        $set: languages.length ? _reduceInstanceProperty(languages).call(languages, (labelValue, language) => _objectSpread(_objectSpread({}, labelValue), {}, {
          [language]: _includesInstanceProperty(currentLabelLanguages).call(currentLabelLanguages, language) ? field[labelKey][language] : fillerLabel
        }), {}) : fillerLabel
      }
    });
  }, {}));
  if (restricted.options) {
    restricted.options = restricted.options.map(o => restrictLabelLanguages(o, languages));
  }
  return restricted;
}
function applyToSchema(schema) {
  var _schema$fields;
  let languages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  if (((_schema$fields = !(schema !== null && schema !== void 0 && schema.fields)) !== null && _schema$fields !== void 0 ? _schema$fields : []).length) {
    return schema;
  }
  return ih(schema, {
    fields: {
      $set: schema.fields.map(f => restrictLabelLanguages(f, languages))
    }
  });
}
export default Object.assign(restrictLabelLanguages, {
  applyToSchema
});
//# sourceMappingURL=restrictLabelLanguages.js.map