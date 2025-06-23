"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/objectSpread2"));
var _assign2 = _interopRequireDefault(require("lodash/assign.js"));
var _keys2 = _interopRequireDefault(require("lodash/keys.js"));
var _isObject2 = _interopRequireDefault(require("lodash/isObject.js"));
var _get2 = _interopRequireDefault(require("lodash/get.js"));
var _set2 = _interopRequireDefault(require("lodash/set.js"));
var _isArray2 = _interopRequireDefault(require("lodash/isArray.js"));
var _listify = _interopRequireDefault(require("../listify"));
var _utils = _interopRequireDefault(require("./utils"));
var _clean = _interopRequireDefault(require("./clean"));
var _withFieldValueMatches = _interopRequireDefault(require("./withFieldValueMatches"));
const defaults = {
  fields: {}
};
function schema(options) {
  if (!options) {
    throw new Error('schema params missing at creation');
  }
  const params = (0, _objectSpread2.default)((0, _objectSpread2.default)({
    field: null,
    list: false
  }, defaults), options.fields ? options : {
    fields: options,
    root: true
  });
  if (params.root) {
    Object.assign(params, (0, _clean.default)(params.fields));
  }
  const defaultValue = _utils.default.getDefault(params.fields);
  function validate(value) {
    const flattened = _utils.default.mapValuesToValidators(params.fields, value, defaultValue);
    let errors = [];
    const clean = {};
    flattened.forEach(flat => {
      try {
        clean[flat.field] = flat.isEnabled ? flat.validator(flat.value) : null;
      } catch (errs) {
        if (!(0, _isArray2.default)(errs)) throw errs;
        errors = errors.concat(errs.map(e => params.field ? (0, _objectSpread2.default)((0, _objectSpread2.default)({}, e), {}, {
          field: "".concat(params.field, ".").concat(e.field)
        }) : e));
      }
    });
    if (errors.length) {
      throw errors;
    }
    return clean;
  }
  function parts(paths, value) {
    const clean = {};
    const errors = [];
    paths.forEach(p => {
      try {
        (0, _set2.default)(clean, p, part(p, (0, _get2.default)(value, p), value));
      } catch (errs) {
        [].concat(errs).forEach(err => errors.push(err));
      }
    });
    if (errors.length) throw errors;
    return clean;
  }
  function part(path, value, contextValues) {
    if (Array.isArray(path)) {
      return parts(path, value);
    }

    // only the values to be evaluated are provided
    if ((0, _isObject2.default)(path)) {
      const schemaFields = (0, _keys2.default)(params.fields);
      return parts((0, _keys2.default)(path).filter(field => (0, _includes.default)(schemaFields).call(schemaFields, field)), path);
    }
    let cursor = params.fields;
    const branches = path.split('.');
    const leaf = branches.pop();

    // dig down
    branches.forEach(b => {
      cursor = cursor[b].fields;
    });
    cursor = cursor[leaf];
    const type = cursor && cursor.type;
    if (!type) {
      throw {
        code: 'field.notdefined',
        message: 'field isn\'t defined',
        field: leaf
      };
    }
    if (cursor.enableWith && !(0, _withFieldValueMatches.default)(cursor, 'enableWith', contextValues, params.fields)) {
      return null;
    }
    const validator = registeredValidators[type](cursor);
    return validator(value);
  }
  if (params.field) {
    Object.assign(validate, {
      field: params.field
    });
  }

  /**
   * exposed endpoints
   */
  return (0, _assign2.default)(params.list ? (0, _listify.default)(validate, params) : validate, {
    part,
    defaultValue,
    // .default is not tolerated by ie8
    default: defaultValue,
    fields: params.fields,
    type: 'schema',
    struct: params.root ? options : params.fields // legacy
  });
}
const registeredValidators = {
  schema
};
function register(v) {
  Object.keys(v).forEach(k => {
    registeredValidators[k] = v[k];
  });
  _utils.default.registerValidators(registeredValidators);
}
var _default = exports.default = Object.assign(schema, {
  register
});
module.exports = exports.default;
//# sourceMappingURL=index.js.map