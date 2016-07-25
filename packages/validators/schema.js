"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _object = require('./object');

var _object2 = _interopRequireDefault(_object);

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validators = {};

schema.register = register;

module.exports = schema;

function schema(struct) {

  var validator = build(struct);

  validate.part = part;

  return validate;

  function validate(values) {
    var _subValidator = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    var listValues = _mapToList(values);

    var clean = (_subValidator || validator)(listValues);

    return _mapToObject(clean);
  }

  function part(address, values) {

    var subStruct = struct;

    // dig in the struct to reach the right spot
    address.split('.').forEach(function (a) {

      subStruct = subStruct[a];
    });

    if (subStruct === undefined) throw new Error('Schema part not found: ' + address);

    if (_isLeaf(subStruct)) {

      return _buildValidator(address, subStruct)(values);
    }

    return validate(values, build(subStruct));
  }
}

function build(struct, field) {

  var validatorStruct = Object.keys(struct).map(function (k) {

    var type = struct[k].type || 'object';

    if (type !== 'object' && typeof validators[type] === 'undefined') {

      throw 'unregistered validator type: ' + struct[k].type;
    }

    if (type === 'object') {

      return build(struct[k], k);
    } else {

      return _buildValidator(k, struct[k]);
    }
  });

  return (0, _object2.default)({ field: field }, validatorStruct);
}

function register(v) {

  Object.keys(v).forEach(function (k) {

    validators[k] = v[k];
  });
}

function _mapToList(values) {

  if (!values) return [];

  return Object.keys(values).map(function (k) {

    var isObject = values[k] && _typeof(values[k]) === 'object';

    return {
      field: k,
      value: isObject ? _mapToList(values[k]) : values[k]
    };
  });
}

function _mapToObject(values) {

  if (!values) return {};

  var obj = {};

  values.forEach(function (v) {

    if (v.field.split('.').length > 1) {
      (function () {

        var cursor = obj,
            namespaces = v.field.split('.'),
            field = namespaces.pop();

        namespaces.forEach(function (namespace) {

          if (obj[namespace] === undefined) obj[namespace] = {};

          cursor = cursor[namespace];
        });

        cursor[field] = v.value;
      })();
    } else {

      obj[v.field] = v.value;
    }
  });

  return obj;
}

/**
 * is a leaf if no objects are referenced in structure
 */
function _isLeaf(struct) {

  return !Object.keys(struct).filter(function (k) {
    return struct[k] !== null && _typeof(struct[k]) === 'object';
  }).length;
}

function _buildValidator(field, definition) {

  return validators[definition.type](_utils2.default.extend(definition, { field: field }));
}