"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('lodash/core');

var _core2 = _interopRequireDefault(_core);

var _number = require('./number');

var _number2 = _interopRequireDefault(_number);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {

  var params = _core2.default.extend({
    field: false,
    optional: true,
    min: null,
    max: null,
    default: null
  }, config || {});

  var validateNumber = (0, _number2.default)(params);

  return _core2.default.extend(function (value) {

    var clean = null,
        errors = [];

    try {

      clean = validateNumber(value);
    } catch (e) {

      errors = e;
    }

    if (errors.length) {

      throw errors.map(function (e) {

        e.code = e.code.replace('number', 'integer');
        e.message = e.message.replace('number', 'integer');
      });
    }

    if (clean === null) {

      return null;
    }

    if (parseInt(clean) !== parseFloat(clean)) {

      throw [_core2.default.extend({
        code: 'integer.invalid',
        message: 'not an integer',
        origin: value
      }, params.field ? { field: params.field } : {})];
    }

    return clean;
  }, {
    type: 'integer',
    field: params.field
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlZ2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7a0JBRWUsa0JBQVU7O0FBRXZCLE1BQU0sU0FBUyxlQUFFLE1BQUYsQ0FBVTtBQUN2QixXQUFPLEtBRGdCO0FBRXZCLGNBQVUsSUFGYTtBQUd2QixTQUFLLElBSGtCO0FBSXZCLFNBQUssSUFKa0I7QUFLdkIsYUFBUztBQUxjLEdBQVYsRUFNWixVQUFVLEVBTkUsQ0FBZjs7QUFRQSxNQUFNLGlCQUFpQixzQkFBaUIsTUFBakIsQ0FBdkI7O0FBRUEsU0FBTyxlQUFFLE1BQUYsQ0FBVSxpQkFBUzs7QUFFeEIsUUFBSSxRQUFRLElBQVo7QUFBQSxRQUFrQixTQUFTLEVBQTNCOztBQUVBLFFBQUk7O0FBRUYsY0FBUSxlQUFnQixLQUFoQixDQUFSO0FBRUQsS0FKRCxDQUlFLE9BQVEsQ0FBUixFQUFZOztBQUVaLGVBQVMsQ0FBVDtBQUVEOztBQUVELFFBQUssT0FBTyxNQUFaLEVBQXFCOztBQUVuQixZQUFNLE9BQU8sR0FBUCxDQUFZLGFBQUs7O0FBRXJCLFVBQUUsSUFBRixHQUFTLEVBQUUsSUFBRixDQUFPLE9BQVAsQ0FBZ0IsUUFBaEIsRUFBMEIsU0FBMUIsQ0FBVDtBQUNBLFVBQUUsT0FBRixHQUFZLEVBQUUsT0FBRixDQUFVLE9BQVYsQ0FBbUIsUUFBbkIsRUFBNkIsU0FBN0IsQ0FBWjtBQUVELE9BTEssQ0FBTjtBQU9EOztBQUVELFFBQUssVUFBVSxJQUFmLEVBQXNCOztBQUVwQixhQUFPLElBQVA7QUFFRDs7QUFFRCxRQUFLLFNBQVUsS0FBVixNQUFzQixXQUFZLEtBQVosQ0FBM0IsRUFBaUQ7O0FBRS9DLFlBQU0sQ0FBRSxlQUFFLE1BQUYsQ0FBVTtBQUNoQixjQUFNLGlCQURVO0FBRWhCLGlCQUFTLGdCQUZPO0FBR2hCLGdCQUFRO0FBSFEsT0FBVixFQUlMLE9BQU8sS0FBUCxHQUFlLEVBQUUsT0FBTyxPQUFPLEtBQWhCLEVBQWYsR0FBeUMsRUFKcEMsQ0FBRixDQUFOO0FBTUQ7O0FBRUQsV0FBTyxLQUFQO0FBRUQsR0EzQ00sRUEyQ0o7QUFDRCxVQUFNLFNBREw7QUFFRCxXQUFPLE9BQU87QUFGYixHQTNDSSxDQUFQO0FBZ0RELEMiLCJmaWxlIjoiaW50ZWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gvY29yZSc7XG5pbXBvcnQgbnVtYmVyVmFsaWRhdG9yIGZyb20gJy4vbnVtYmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnID0+IHtcblxuICBjb25zdCBwYXJhbXMgPSBfLmV4dGVuZCgge1xuICAgIGZpZWxkOiBmYWxzZSxcbiAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICBtaW46IG51bGwsXG4gICAgbWF4OiBudWxsLFxuICAgIGRlZmF1bHQ6IG51bGxcbiAgfSwgY29uZmlnIHx8IHt9ICk7XG5cbiAgY29uc3QgdmFsaWRhdGVOdW1iZXIgPSBudW1iZXJWYWxpZGF0b3IoIHBhcmFtcyApO1xuXG4gIHJldHVybiBfLmV4dGVuZCggdmFsdWUgPT4ge1xuXG4gICAgbGV0IGNsZWFuID0gbnVsbCwgZXJyb3JzID0gW107XG5cbiAgICB0cnkge1xuXG4gICAgICBjbGVhbiA9IHZhbGlkYXRlTnVtYmVyKCB2YWx1ZSApO1xuXG4gICAgfSBjYXRjaCAoIGUgKSB7XG5cbiAgICAgIGVycm9ycyA9IGU7XG5cbiAgICB9XG5cbiAgICBpZiAoIGVycm9ycy5sZW5ndGggKSB7XG5cbiAgICAgIHRocm93IGVycm9ycy5tYXAoIGUgPT4ge1xuXG4gICAgICAgIGUuY29kZSA9IGUuY29kZS5yZXBsYWNlKCAnbnVtYmVyJywgJ2ludGVnZXInICk7XG4gICAgICAgIGUubWVzc2FnZSA9IGUubWVzc2FnZS5yZXBsYWNlKCAnbnVtYmVyJywgJ2ludGVnZXInICk7XG5cbiAgICAgIH0gKTtcblxuICAgIH1cblxuICAgIGlmICggY2xlYW4gPT09IG51bGwgKSB7XG5cbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgfVxuXG4gICAgaWYgKCBwYXJzZUludCggY2xlYW4gKSAhPT0gcGFyc2VGbG9hdCggY2xlYW4gKSApIHtcblxuICAgICAgdGhyb3cgW8KgXy5leHRlbmQoIHtcbiAgICAgICAgY29kZTogJ2ludGVnZXIuaW52YWxpZCcsXG4gICAgICAgIG1lc3NhZ2U6ICdub3QgYW4gaW50ZWdlcicsXG4gICAgICAgIG9yaWdpbjogdmFsdWVcbiAgICAgIH0sIHBhcmFtcy5maWVsZCA/IHsgZmllbGQ6IHBhcmFtcy5maWVsZCB9IDoge30gKSBdO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFuO1xuXG4gIH0sIHtcbiAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgZmllbGQ6IHBhcmFtcy5maWVsZFxuICB9ICk7XG5cbn0iXX0=