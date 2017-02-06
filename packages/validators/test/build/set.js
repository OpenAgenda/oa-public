"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (validators, options) {

  validate.type = 'set';

  var params = _utils2.default.extend({
    compact: false
  }, options || {});

  return validate;

  function validate(valuesSet) {

    var errors = [],
        clean = [],
        compacted = {};

    validators.forEach(function (validator) {

      var matchingValue = valuesSet.filter(function (v) {

        return v.field === validator.field;
      });

      matchingValue = matchingValue.length ? matchingValue[0] : { field: validator.field, value: undefined };

      try {

        clean.push({
          field: matchingValue.field,
          value: validator(matchingValue.value)
        });
      } catch (e) {

        errors = errors.concat(e);
      }
    });

    if (errors.length) {

      throw errors;
    }

    if (params.compact) {

      clean.forEach(function (c) {

        compacted[c.field] = c.value;
      });

      return compacted;
    }

    return clean;
  }
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQUVBOzs7Ozs7a0JBRWUsVUFBRSxVQUFGLEVBQWMsT0FBZCxFQUEyQjs7QUFFeEMsV0FBUyxJQUFULEdBQWdCLEtBQWhCOztBQUVBLE1BQUksU0FBUyxnQkFBTSxNQUFOLENBQWM7QUFDekIsYUFBUztBQURnQixHQUFkLEVBRVYsV0FBVyxFQUZELENBQWI7O0FBSUEsU0FBTyxRQUFQOztBQUVBLFdBQVMsUUFBVCxDQUFtQixTQUFuQixFQUErQjs7QUFFN0IsUUFBSSxTQUFTLEVBQWI7QUFBQSxRQUFpQixRQUFRLEVBQXpCO0FBQUEsUUFBNkIsWUFBWSxFQUF6Qzs7QUFFQSxlQUFXLE9BQVgsQ0FBb0IsVUFBVSxTQUFWLEVBQXNCOztBQUV4QyxVQUFJLGdCQUFnQixVQUFVLE1BQVYsQ0FBa0IsVUFBVSxDQUFWLEVBQWM7O0FBRWxELGVBQU8sRUFBRSxLQUFGLEtBQVksVUFBVSxLQUE3QjtBQUVELE9BSm1CLENBQXBCOztBQU1BLHNCQUFnQixjQUFjLE1BQWQsR0FBdUIsY0FBZSxDQUFmLENBQXZCLEdBQTRDLEVBQUUsT0FBTyxVQUFVLEtBQW5CLEVBQTBCLE9BQU8sU0FBakMsRUFBNUQ7O0FBRUEsVUFBSTs7QUFFRixjQUFNLElBQU4sQ0FBWTtBQUNWLGlCQUFPLGNBQWMsS0FEWDtBQUVWLGlCQUFPLFVBQVcsY0FBYyxLQUF6QjtBQUZHLFNBQVo7QUFLRCxPQVBELENBT0UsT0FBTyxDQUFQLEVBQVc7O0FBRVgsaUJBQVMsT0FBTyxNQUFQLENBQWUsQ0FBZixDQUFUO0FBRUQ7QUFFRixLQXZCRDs7QUF5QkEsUUFBSyxPQUFPLE1BQVosRUFBcUI7O0FBRW5CLFlBQU0sTUFBTjtBQUVEOztBQUVELFFBQUssT0FBTyxPQUFaLEVBQXNCOztBQUVwQixZQUFNLE9BQU4sQ0FBZSxVQUFVLENBQVYsRUFBYzs7QUFFM0Isa0JBQVcsRUFBRSxLQUFiLElBQXVCLEVBQUUsS0FBekI7QUFFRCxPQUpEOztBQU1BLGFBQU8sU0FBUDtBQUVEOztBQUVELFdBQU8sS0FBUDtBQUVEO0FBRUYsQyIsImZpbGUiOiJzZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IHV0aWxzIGZyb20gJ3V0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCAoIHZhbGlkYXRvcnMsIG9wdGlvbnMgKSA9PiB7XG5cbiAgdmFsaWRhdGUudHlwZSA9ICdzZXQnO1xuXG4gIHZhciBwYXJhbXMgPSB1dGlscy5leHRlbmQoIHtcbiAgICBjb21wYWN0OiBmYWxzZVxuICB9LCBvcHRpb25zIHx8wqB7fSApO1xuXG4gIHJldHVybiB2YWxpZGF0ZTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZSggdmFsdWVzU2V0ICkge1xuXG4gICAgdmFyIGVycm9ycyA9IFtdLCBjbGVhbiA9IFtdLCBjb21wYWN0ZWQgPSB7fTtcblxuICAgIHZhbGlkYXRvcnMuZm9yRWFjaCggZnVuY3Rpb24oIHZhbGlkYXRvciApIHtcblxuICAgICAgdmFyIG1hdGNoaW5nVmFsdWUgPSB2YWx1ZXNTZXQuZmlsdGVyKCBmdW5jdGlvbiggdiApIHtcblxuICAgICAgICByZXR1cm4gdi5maWVsZCA9PT0gdmFsaWRhdG9yLmZpZWxkO1xuXG4gICAgICB9ICk7XG5cbiAgICAgIG1hdGNoaW5nVmFsdWUgPSBtYXRjaGluZ1ZhbHVlLmxlbmd0aCA/IG1hdGNoaW5nVmFsdWVbIDAgXSA6IHsgZmllbGQ6IHZhbGlkYXRvci5maWVsZCwgdmFsdWU6IHVuZGVmaW5lZCB9XG5cbiAgICAgIHRyeSB7XG5cbiAgICAgICAgY2xlYW4ucHVzaCgge1xuICAgICAgICAgIGZpZWxkOiBtYXRjaGluZ1ZhbHVlLmZpZWxkLFxuICAgICAgICAgIHZhbHVlOiB2YWxpZGF0b3IoIG1hdGNoaW5nVmFsdWUudmFsdWUgKVxuICAgICAgICB9ICk7XG5cbiAgICAgIH0gY2F0Y2goIGUgKSB7XG5cbiAgICAgICAgZXJyb3JzID0gZXJyb3JzLmNvbmNhdCggZSApO1xuXG4gICAgICB9XG5cbiAgICB9ICk7XG5cbiAgICBpZiAoIGVycm9ycy5sZW5ndGggKSB7XG5cbiAgICAgIHRocm93IGVycm9ycztcblxuICAgIH1cblxuICAgIGlmICggcGFyYW1zLmNvbXBhY3QgKSB7XG5cbiAgICAgIGNsZWFuLmZvckVhY2goIGZ1bmN0aW9uKCBjICkge1xuXG4gICAgICAgIGNvbXBhY3RlZFvCoGMuZmllbGQgXSA9IGMudmFsdWU7XG5cbiAgICAgIH0gKTtcblxuICAgICAgcmV0dXJuIGNvbXBhY3RlZDtcblxuICAgIH1cblxuICAgIHJldHVybiBjbGVhbjtcblxuICB9XG5cbn0iXX0=