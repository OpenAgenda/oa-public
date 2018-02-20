'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toObj = toObj;
exports.toDb = toDb;
exports.listFields = listFields;
exports.default = {
  toObj: toObj,
  toDb: toDb,
  listFields: listFields
};
function toObj(fieldsMap, data) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // parse result of select, create and update

  return fieldsMap.reduce(function (result, field) {

    //

  }, {});
}

function toDb(fieldsMap, type, data) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


  return fieldsMap.reduce(function (result, field) {

    if (['insert', 'update'].includes(type)) {

      if (field.protected && options.protected) {
        return result;
      }
    } else if (['select'].includes(type)) {

      if (field.internal && !options.internal) {
        return result;
      }
    }

    var value = data[field.obj];

    if (value === undefined) {
      return result;
    }

    result[field.db] = field.json ? JSON.stringify(value) : value;

    return result;
  }, {});
}

function listFields(fieldsMap) {
  var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'db';
  var type = arguments[2];
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


  return filter(fieldsMap, type, options).map(function (field) {
    return field[from];
  });
}

function filter(fieldsMap, type) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


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