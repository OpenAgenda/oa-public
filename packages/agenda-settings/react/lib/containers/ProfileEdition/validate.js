'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schema = undefined;
exports.validate = validate;
exports.asyncValidate = asyncValidate;

var _public = require('agendas/service/validate/public');

var _public2 = _interopRequireDefault(_public);

var _agenda = require('../../redux/modules/agenda');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var schema = exports.schema = _public2.default.struct;

function validate(values) {
  try {

    (0, _public2.default)(values);
  } catch (e) {

    return Object.assign.apply(Object, _toConsumableArray(e.map(function (v) {
      return _defineProperty({}, v.field, v.code);
    })));
  }

  return true;
}

function asyncValidate(values, dispatch, props) {

  return dispatch((0, _agenda.checkSlug)({
    slug: values.slug,
    excludeUid: props.initialValues.uid
  })).then(function (_ref2) {
    var error = _ref2.error;

    if (error && error.errors) {
      return Object.assign.apply(Object, _toConsumableArray(error.errors.map(function (v) {
        return _defineProperty({}, v.field, v.code);
      })));
    }
    return true;
  });
}