import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import getWithFieldName from './getWithFieldName.js';
export default function isFieldReferencedByField(field, byField) {
  var _context, _byField$related;
  const references = [].concat(getWithFieldName(byField.optionalWith)).concat(getWithFieldName(byField.enableWith)).concat(_reduceInstanceProperty(_context = Object.keys((_byField$related = byField.related) !== null && _byField$related !== void 0 ? _byField$related : {})).call(_context, (related, key) => related.concat(byField.related[key]), []));
  return _includesInstanceProperty(references).call(references, field.field);
}
//# sourceMappingURL=isFieldReferencedByField.js.map