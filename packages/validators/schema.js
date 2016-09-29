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

  validate.struct = struct;

  validate.default = _getDefault(struct);

  return validate;

  function validate(values) {
    var _subValidator = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    var subStruct = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];


    // initialize undefined or null to empty obj if top level
    if (_subValidator === null && subStruct === null && !values) {

      values = {};
    }

    var listValues = _mapToList(values, subStruct || struct);

    var clean = (_subValidator || validator)(listValues);

    return _mapToObject(clean);
  }

  /**
   * validate a subset of the schema
   * @param  list   fields     the list of fields
   * @param  object values     values to be validated
   * 
   * @return object            the object of clean values
   */
  function part(fields, values) {

    if (typeof fields === 'string') {

      return validateField(fields, values);
    }

    // if is not a string, fields is an array of field names

    if (!_utils2.default.isArray(fields)) {

      throw 'wrong part input';
    }

    var clean = {},
        errors = [];

    fields.forEach(function (field) {

      // dig into values object if field is deep

      var value = values;

      field.split('.').forEach(function (fieldPart) {

        value = value[fieldPart];
      });

      try {
        (function () {

          var cleanPart = clean,
              fieldParts = field.split('.'),
              leafField = fieldParts.pop();

          fieldParts.forEach(function (fieldPart) {

            if (!cleanPart[fieldPart]) cleanPart[fieldPart] = {};

            cleanPart = cleanPart[fieldPart];
          });

          cleanPart[leafField] = validateField(field, value);
        })();
      } catch (e) {

        errors = errors.concat(e);
      }
    });

    if (errors.length) throw errors;

    return clean;
  }

  function validateField(address, values) {

    var subStruct = struct;

    // dig in the struct to reach the right spot
    address.split('.').forEach(function (a) {

      subStruct = subStruct[a];
    });

    if (subStruct === undefined) throw new Error('Schema part not found: ' + address);

    if (_isLeaf(subStruct)) {

      return _buildValidator(address, subStruct)(values);
    }

    return validate(values, build(subStruct), subStruct);
  }
}

function build(struct, field) {

  var validatorStruct = Object.keys(struct).map(function (k) {

    var type = _getType(k, struct);

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

function _mapToList(values, struct) {

  return Object.keys(struct).map(function (k) {

    // filter out non defined values which are non-objects

    var type = _getType(k, struct);

    if (type === 'object' && (typeof values[k] === 'undefined' || values[k] === null)) {

      return {
        field: k,
        value: [{}]
      };
    }

    if (typeof values[k] === 'undefined') {

      return false;
    }

    return {
      field: k,
      value: type === 'object' ? _mapToList(values[k], struct[k]) : values[k]
    };
  }).filter(function (v) {
    return v;
  });
}

function _getType(k, struct) {

  var type = struct[k].type || 'object';

  // handle special case where sub object is keyed with 'type'
  if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) === 'object') {

    type = 'object';
  }

  return type;
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

          if (cursor[namespace] === undefined) cursor[namespace] = {};

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

function _getDefault(struct) {

  var d = {};

  Object.keys(struct).forEach(function (k) {

    if (!struct[k]) {

      d[k] = null;
    } else if (_isLeaf(struct[k])) {

      d[k] = struct[k].default === undefined ? null : struct[k].default;
    } else {

      d[k] = _getDefault(struct[k]);
    }
  });

  return d;
}