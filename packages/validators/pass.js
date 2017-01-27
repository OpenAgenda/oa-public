"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {

  var params = (0, _extend2.default)({
    field: undefined,
    type: 'pass',
    list: false
  }, config || {}),
      validator = (0, _extend2.default)(function (v) {
    return v;
  }, {
    type: 'pass',
    field: params.field
  });

  return params.list ? (0, _listify2.default)(validator, params) : validator;
};

module.exports = exports['default'];