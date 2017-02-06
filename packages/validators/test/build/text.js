"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {

  var params = (0, _extend2.default)({
    field: false, // required
    min: 0,
    max: 1000000,
    trim: true,
    optional: true,
    default: null,
    list: false
  }, config || {}),
      validator = (0, _extend2.default)(validate, {
    type: 'text',
    field: params.field
  });

  return params.list ? (0, _listify2.default)(validator, params) : validator;

  function validate(value) {

    var clean = value ? value + '' : '';

    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' && clean) {

      // there is something there and it is not a string

      throw [{
        field: validate.field,
        code: 'string.invalidtype',
        message: 'not a string',
        origin: value
      }];
    }

    if (params.trim) {

      clean = clean.trim();
    }

    if (typeof value === 'undefined' || value === null || !clean.length) {

      if (params.optional || params.default !== null) return params.default;

      throw [{
        field: validate.field,
        code: 'required',
        message: 'a string is required',
        origin: value
      }];
    }

    if (clean.length < params.min) {

      throw [{
        field: validate.field,
        code: 'string.tooshort',
        message: 'the string is too short',
        values: {
          min: params.min,
          max: params.max
        },
        origin: value
      }];
    }

    if (clean.length > params.max) {

      throw [{
        field: validate.field,
        code: 'string.toolong',
        message: 'the string is too long',
        values: {
          min: params.min,
          max: params.max
        },
        origin: value
      }];
    }

    return clean;
  }
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztBQUVBOzs7O0FBQ0E7Ozs7OztrQkFFZSxrQkFBVTs7QUFFdkIsTUFBTSxTQUFTLHNCQUFRO0FBQ3JCLFdBQU8sS0FEYyxFQUNQO0FBQ2QsU0FBSyxDQUZnQjtBQUdyQixTQUFLLE9BSGdCO0FBSXJCLFVBQU0sSUFKZTtBQUtyQixjQUFVLElBTFc7QUFNckIsYUFBUyxJQU5ZO0FBT3JCLFVBQU07QUFQZSxHQUFSLEVBUVosVUFBVSxFQVJFLENBQWY7QUFBQSxNQVVBLFlBQVksc0JBQVEsUUFBUixFQUFrQjtBQUM1QixVQUFNLE1BRHNCO0FBRTVCLFdBQU8sT0FBTztBQUZjLEdBQWxCLENBVlo7O0FBZUEsU0FBTyxPQUFPLElBQVAsR0FBYyx1QkFBUyxTQUFULEVBQW9CLE1BQXBCLENBQWQsR0FBNkMsU0FBcEQ7O0FBRUEsV0FBUyxRQUFULENBQW1CLEtBQW5CLEVBQTJCOztBQUV6QixRQUFJLFFBQVEsUUFBUSxRQUFRLEVBQWhCLEdBQXFCLEVBQWpDOztBQUVBLFFBQUssUUFBTyxLQUFQLHlDQUFPLEtBQVAsTUFBZ0IsUUFBaEIsSUFBNEIsS0FBakMsRUFBeUM7O0FBRXZDOztBQUVBLFlBQU0sQ0FBRTtBQUNOLGVBQU8sU0FBUyxLQURWO0FBRU4sY0FBTSxvQkFGQTtBQUdOLGlCQUFTLGNBSEg7QUFJTixnQkFBUTtBQUpGLE9BQUYsQ0FBTjtBQU9EOztBQUVELFFBQUssT0FBTyxJQUFaLEVBQW1COztBQUVqQixjQUFRLE1BQU0sSUFBTixFQUFSO0FBRUQ7O0FBRUQsUUFBSyxPQUFPLEtBQVAsS0FBaUIsV0FBakIsSUFBZ0MsVUFBVSxJQUExQyxJQUFrRCxDQUFDLE1BQU0sTUFBOUQsRUFBdUU7O0FBRXJFLFVBQUssT0FBTyxRQUFQLElBQW1CLE9BQU8sT0FBUCxLQUFtQixJQUEzQyxFQUFrRCxPQUFPLE9BQU8sT0FBZDs7QUFFbEQsWUFBTSxDQUFFO0FBQ04sZUFBTyxTQUFTLEtBRFY7QUFFTixjQUFNLFVBRkE7QUFHTixpQkFBUyxzQkFISDtBQUlOLGdCQUFRO0FBSkYsT0FBRixDQUFOO0FBT0Q7O0FBRUQsUUFBSyxNQUFNLE1BQU4sR0FBZSxPQUFPLEdBQTNCLEVBQWlDOztBQUUvQixZQUFNLENBQUU7QUFDTixlQUFPLFNBQVMsS0FEVjtBQUVOLGNBQU0saUJBRkE7QUFHTixpQkFBUyx5QkFISDtBQUlOLGdCQUFRO0FBQ04sZUFBSyxPQUFPLEdBRE47QUFFTixlQUFLLE9BQU87QUFGTixTQUpGO0FBUU4sZ0JBQVE7QUFSRixPQUFGLENBQU47QUFXRDs7QUFFRCxRQUFLLE1BQU0sTUFBTixHQUFlLE9BQU8sR0FBM0IsRUFBaUM7O0FBRS9CLFlBQU0sQ0FBRTtBQUNOLGVBQU8sU0FBUyxLQURWO0FBRU4sY0FBTSxnQkFGQTtBQUdOLGlCQUFTLHdCQUhIO0FBSU4sZ0JBQVE7QUFDTixlQUFLLE9BQU8sR0FETjtBQUVOLGVBQUssT0FBTztBQUZOLFNBSkY7QUFRTixnQkFBUTtBQVJGLE9BQUYsQ0FBTjtBQVdEOztBQUVELFdBQU8sS0FBUDtBQUVEO0FBRUYsQyIsImZpbGUiOiJ0ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBleHRlbmQgZnJvbSAnbG9kYXNoL2V4dGVuZCc7XG5pbXBvcnQgbGlzdGlmeSBmcm9tICcuL2xpc3RpZnknO1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWcgPT4ge1xuXG4gIGNvbnN0IHBhcmFtcyA9IGV4dGVuZCgge1xuICAgIGZpZWxkOiBmYWxzZSwgLy8gcmVxdWlyZWRcbiAgICBtaW46IDAsXG4gICAgbWF4OiAxMDAwMDAwLFxuICAgIHRyaW06IHRydWUsXG4gICAgb3B0aW9uYWw6IHRydWUsXG4gICAgZGVmYXVsdDogbnVsbCxcbiAgICBsaXN0OiBmYWxzZVxuICB9LCBjb25maWcgfHwge30gKSxcblxuICB2YWxpZGF0b3IgPSBleHRlbmQoIHZhbGlkYXRlLCB7XG4gICAgdHlwZTogJ3RleHQnLFxuICAgIGZpZWxkOiBwYXJhbXMuZmllbGRcbiAgfSApO1xuXG4gIHJldHVybiBwYXJhbXMubGlzdCA/IGxpc3RpZnkoIHZhbGlkYXRvciwgcGFyYW1zICkgOiB2YWxpZGF0b3I7XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGUoIHZhbHVlICkge1xuXG4gICAgdmFyIGNsZWFuID0gdmFsdWUgPyB2YWx1ZSArwqAnJyA6ICcnO1xuXG4gICAgaWYgKCB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgY2xlYW4gKSB7XG5cbiAgICAgIC8vIHRoZXJlIGlzIHNvbWV0aGluZyB0aGVyZSBhbmQgaXQgaXMgbm90IGEgc3RyaW5nXG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBmaWVsZDogdmFsaWRhdGUuZmllbGQsXG4gICAgICAgIGNvZGU6ICdzdHJpbmcuaW52YWxpZHR5cGUnLFxuICAgICAgICBtZXNzYWdlOiAnbm90IGEgc3RyaW5nJyxcbiAgICAgICAgb3JpZ2luOiB2YWx1ZVxuICAgICAgfSBdXG5cbiAgICB9XG5cbiAgICBpZiAoIHBhcmFtcy50cmltICkge1xuXG4gICAgICBjbGVhbiA9IGNsZWFuLnRyaW0oKTtcblxuICAgIH1cblxuICAgIGlmICggdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCAhY2xlYW4ubGVuZ3RoICkge1xuXG4gICAgICBpZiAoIHBhcmFtcy5vcHRpb25hbCB8fMKgcGFyYW1zLmRlZmF1bHQgIT09IG51bGwgKSByZXR1cm4gcGFyYW1zLmRlZmF1bHQ7XG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBmaWVsZDogdmFsaWRhdGUuZmllbGQsXG4gICAgICAgIGNvZGU6ICdyZXF1aXJlZCcsXG4gICAgICAgIG1lc3NhZ2U6ICdhIHN0cmluZyBpcyByZXF1aXJlZCcsXG4gICAgICAgIG9yaWdpbjogdmFsdWVcbiAgICAgIH0gXTtcblxuICAgIH1cblxuICAgIGlmICggY2xlYW4ubGVuZ3RoIDwgcGFyYW1zLm1pbiApIHtcblxuICAgICAgdGhyb3cgWyB7XG4gICAgICAgIGZpZWxkOiB2YWxpZGF0ZS5maWVsZCxcbiAgICAgICAgY29kZTogJ3N0cmluZy50b29zaG9ydCcsXG4gICAgICAgIG1lc3NhZ2U6ICd0aGUgc3RyaW5nIGlzIHRvbyBzaG9ydCcsXG4gICAgICAgIHZhbHVlczoge1xuICAgICAgICAgIG1pbjogcGFyYW1zLm1pbixcbiAgICAgICAgICBtYXg6IHBhcmFtcy5tYXhcbiAgICAgICAgfSxcbiAgICAgICAgb3JpZ2luOiB2YWx1ZVxuICAgICAgfSBdO1xuXG4gICAgfVxuXG4gICAgaWYgKCBjbGVhbi5sZW5ndGggPiBwYXJhbXMubWF4ICkge1xuXG4gICAgICB0aHJvdyBbIHtcbiAgICAgICAgZmllbGQ6IHZhbGlkYXRlLmZpZWxkLFxuICAgICAgICBjb2RlOiAnc3RyaW5nLnRvb2xvbmcnLFxuICAgICAgICBtZXNzYWdlOiAndGhlIHN0cmluZyBpcyB0b28gbG9uZycsXG4gICAgICAgIHZhbHVlczoge1xuICAgICAgICAgIG1pbjogcGFyYW1zLm1pbixcbiAgICAgICAgICBtYXg6IHBhcmFtcy5tYXhcbiAgICAgICAgfSxcbiAgICAgICAgb3JpZ2luOiB2YWx1ZVxuICAgICAgfSBdO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFuO1xuXG4gIH1cblxufSJdfQ==