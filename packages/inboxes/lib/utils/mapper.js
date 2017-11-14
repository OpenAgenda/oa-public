'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.toObj = toObj;
exports.toDb = toDb;
exports.listFields = listFields;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  toObj: toObj,
  toDb: toDb,
  listFields: listFields
};


var defaultOptions = {
  internal: false,
  protected: true
};

function toObj(fieldsMap, data, options) {
  if (!data) {
    return data;
  }

  return filterFields(fieldsMap, 'select', options).reduce(function (result, field) {
    var value = data[field.db];

    if (value === undefined) {
      return result;
    }

    result[field.obj] = field.json ? JSON.parse(value) : value;

    return result;
  }, {});
}

function toDb(fieldsMap, type, data, options) {
  return filterFields(fieldsMap, type, options).reduce(function (result, field) {
    var value = data[field.obj];

    if (value === undefined) {
      return result;
    }

    result[field.db] = field.json ? (0, _stringify2.default)(value) : value;

    return result;
  }, {});
}

function listFields(fieldsMap, type, from, options) {
  var aliased = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var outputPrefix = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';

  return filterFields(fieldsMap, type, options).map(function (field) {
    var alias = aliased ? ' as ' + ('' + outputPrefix + field['obj']) : '';
    return field[from] + alias;
  });
}

function filterFields(fieldsMap, type, options) {
  options = (0, _extends3.default)({}, defaultOptions, options);

  return fieldsMap.filter(function (field) {
    if (['insert', 'update'].includes(type)) {
      if (field.protected && options.protected) {
        return false;
      }
    } else if (['select'].includes(type)) {
      if (field.internal && !options.internal) {
        return false;
      }
    }

    return true;
  });
}
//# sourceMappingURL=mapper.js.map