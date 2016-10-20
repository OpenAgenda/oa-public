"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = clean;

function clean(schema) {

  if (_isLeaf(schema)) {

    return _utils2.default.extend({}, schema);
  }

  var cleanSchema = { fields: {}, list: false, type: 'schema' },
      schemaFields = void 0;

  if (_isNormalized(schema)) {

    _utils2.default.extend(cleanSchema, schema);

    schemaFields = schema.fields;
  } else {

    schemaFields = schema;
  }

  Object.keys(schemaFields).forEach(function (branchKey) {

    cleanSchema.fields[branchKey] = clean(schemaFields[branchKey]);
  });

  return cleanSchema;
}

function _isNormalized(schema) {

  if (schema.fields) return true;

  return false;
}

function _isLeaf(node) {

  return !Object.keys(node || {}).filter(function (k) {

    return _typeof(node[k]) === 'object';
  }).length;
}