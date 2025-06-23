import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import isObject from '../../iso/isObject.js';
const labelKeys = ['label', 'info', 'placeholder', 'sub'];
function amendWithFieldLanguages(field) {
  var _field$options;
  let existingLanguages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  let updatedLanguages = _reduceInstanceProperty(labelKeys).call(labelKeys, (languages, key) => languages.concat((field[key] && isObject(field[key]) ? Object.keys(field[key]) : []).filter(l => !_includesInstanceProperty(languages).call(languages, l)).filter(l => {
    var _field$key$l;
    return !!((_field$key$l = field[key][l]) !== null && _field$key$l !== void 0 ? _field$key$l : '').length;
  })), existingLanguages);
  ((_field$options = field === null || field === void 0 ? void 0 : field.options) !== null && _field$options !== void 0 ? _field$options : []).forEach(option => {
    updatedLanguages = amendWithFieldLanguages(option, updatedLanguages);
  });
  return updatedLanguages;
}
export default function extractSchemaLabelLanguages(schema) {
  var _context, _schema$fields;
  return _reduceInstanceProperty(_context = (_schema$fields = schema === null || schema === void 0 ? void 0 : schema.fields) !== null && _schema$fields !== void 0 ? _schema$fields : []).call(_context, (languages, field) => amendWithFieldLanguages(field, languages), []);
}
//# sourceMappingURL=extractSchemaLabelLanguages.js.map