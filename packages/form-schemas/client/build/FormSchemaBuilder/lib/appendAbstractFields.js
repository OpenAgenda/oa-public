import _flatten from "lodash/flatten.js";
import _uniq from "lodash/uniq.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
export default (schema, extendedFrom) => _uniq(_flatten(extendedFrom.map(e => e.fields)).map(f => f.field)).filter(field => {
  var _context;
  return !_includesInstanceProperty(_context = schema.fields).call(_context, field);
}).map(field => ({
  field,
  fieldType: 'abstract'
}));
//# sourceMappingURL=appendAbstractFields.js.map