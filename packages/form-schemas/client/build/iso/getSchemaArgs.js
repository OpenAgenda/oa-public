import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _set from "lodash/set.js";
import _get from "lodash/get.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import schema from '@openagenda/validators/schema/index.js';
import getValidatorFromField from './getValidatorFromField.js';
import isObject from './isObject.js';
export default (function (fields) {
  var _context;
  let accessType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  let al = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  const params = _objectSpread({
    includeUnspecified: true,
    custom: {},
    draft: false
  }, options);
  if (isObject(params.custom)) {
    schema.register(params.custom);
  }
  const accessLevel = al === null ? [] : [].concat(al);
  return _reduceInstanceProperty(_context = fields.filter(f => {
    if (accessType === null) return true;
    if (f[accessType] === null && params.includeUnspecified) return true;
    return !!(_get(f, accessType, []) || []).filter(t => _includesInstanceProperty(accessLevel).call(accessLevel, t)).length;
  }).filter(f => {
    if (f.type && f.type !== 'field') {
      return false;
    }
    return f.fieldType !== 'abstract';
  }).map(f => {
    const validatorConfiguration = getValidatorFromField(f, params);
    return validatorConfiguration;
  })).call(_context, (schemaConfiguration, f) => _set(schemaConfiguration, f.field, f), {});
});
//# sourceMappingURL=getSchemaArgs.js.map