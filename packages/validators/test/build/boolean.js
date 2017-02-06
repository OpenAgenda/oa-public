"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {

  var params = _utils2.default.extend({
    field: false,
    default: undefined,
    optional: true
  }, config);

  return _utils2.default.extend(validate, {
    type: 'boolean',
    field: params.field
  });

  function validate(value) {

    if (typeof value === 'undefined') {

      if (!params.optional && typeof params.default === 'undefined') {

        throw [{
          field: validate.field,
          code: 'required',
          message: 'a boolean is required',
          origin: value
        }];
      }

      if (typeof params.default !== 'undefined' && params.default !== null) {

        return !!params.default;
      }

      return null;
    }

    if (value === null && params.default === null) {

      return null;
    }

    if (['0', 'false', false].indexOf(value) !== -1) {

      return false;
    }

    return !!value;
  }
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ib29sZWFuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFFQTs7Ozs7O2tCQUVlLGtCQUFVOztBQUV2QixNQUFJLFNBQVMsZ0JBQU0sTUFBTixDQUFjO0FBQ3pCLFdBQU8sS0FEa0I7QUFFekIsYUFBUyxTQUZnQjtBQUd6QixjQUFVO0FBSGUsR0FBZCxFQUlWLE1BSlUsQ0FBYjs7QUFNQSxTQUFPLGdCQUFNLE1BQU4sQ0FBYyxRQUFkLEVBQXdCO0FBQzdCLFVBQU0sU0FEdUI7QUFFN0IsV0FBTyxPQUFPO0FBRmUsR0FBeEIsQ0FBUDs7QUFLQSxXQUFTLFFBQVQsQ0FBbUIsS0FBbkIsRUFBMkI7O0FBRXpCLFFBQUssT0FBTyxLQUFQLEtBQWlCLFdBQXRCLEVBQW9DOztBQUVsQyxVQUFLLENBQUMsT0FBTyxRQUFSLElBQXNCLE9BQU8sT0FBTyxPQUFkLEtBQTBCLFdBQXJELEVBQXFFOztBQUVuRSxjQUFNLENBQUU7QUFDTixpQkFBTyxTQUFTLEtBRFY7QUFFTixnQkFBTSxVQUZBO0FBR04sbUJBQVMsdUJBSEg7QUFJTixrQkFBUTtBQUpGLFNBQUYsQ0FBTjtBQU9EOztBQUVELFVBQUssT0FBTyxPQUFPLE9BQWQsS0FBMEIsV0FBMUIsSUFBeUMsT0FBTyxPQUFQLEtBQW1CLElBQWpFLEVBQXdFOztBQUV0RSxlQUFPLENBQUMsQ0FBQyxPQUFPLE9BQWhCO0FBRUQ7O0FBRUQsYUFBTyxJQUFQO0FBRUQ7O0FBRUQsUUFBSyxVQUFVLElBQVYsSUFBa0IsT0FBTyxPQUFQLEtBQW1CLElBQTFDLEVBQWlEOztBQUUvQyxhQUFPLElBQVA7QUFFRDs7QUFFRCxRQUFLLENBQUUsR0FBRixFQUFPLE9BQVAsRUFBZ0IsS0FBaEIsRUFBd0IsT0FBeEIsQ0FBaUMsS0FBakMsTUFBNkMsQ0FBQyxDQUFuRCxFQUF1RDs7QUFFckQsYUFBTyxLQUFQO0FBRUQ7O0FBRUQsV0FBTyxDQUFDLENBQUMsS0FBVDtBQUVEO0FBRUYsQyIsImZpbGUiOiJib29sZWFuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB1dGlscyBmcm9tICd1dGlscydcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnID0+IHtcblxuICBsZXQgcGFyYW1zID0gdXRpbHMuZXh0ZW5kKCB7XG4gICAgZmllbGQ6IGZhbHNlLFxuICAgIGRlZmF1bHQ6IHVuZGVmaW5lZCxcbiAgICBvcHRpb25hbDogdHJ1ZVxuICB9LCBjb25maWcgKTtcblxuICByZXR1cm4gdXRpbHMuZXh0ZW5kKCB2YWxpZGF0ZSwge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBmaWVsZDogcGFyYW1zLmZpZWxkXG4gIH0gKTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZSggdmFsdWUgKSB7XG5cbiAgICBpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cbiAgICAgIGlmICggIXBhcmFtcy5vcHRpb25hbCAmJiAoIHR5cGVvZiBwYXJhbXMuZGVmYXVsdCA9PT0gJ3VuZGVmaW5lZCcgKSApIHtcblxuICAgICAgICB0aHJvdyBbIHtcbiAgICAgICAgICBmaWVsZDogdmFsaWRhdGUuZmllbGQsXG4gICAgICAgICAgY29kZTogJ3JlcXVpcmVkJyxcbiAgICAgICAgICBtZXNzYWdlOiAnYSBib29sZWFuIGlzIHJlcXVpcmVkJyxcbiAgICAgICAgICBvcmlnaW46IHZhbHVlXG4gICAgICAgIH0gXTtcblxuICAgICAgfVxuXG4gICAgICBpZiAoIHR5cGVvZiBwYXJhbXMuZGVmYXVsdCAhPT0gJ3VuZGVmaW5lZCcgJiYgcGFyYW1zLmRlZmF1bHQgIT09IG51bGwgKSB7XG5cbiAgICAgICAgcmV0dXJuICEhcGFyYW1zLmRlZmF1bHQ7XG5cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICB9XG5cbiAgICBpZiAoIHZhbHVlID09PSBudWxsICYmIHBhcmFtcy5kZWZhdWx0ID09PSBudWxsICkge1xuXG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIH1cblxuICAgIGlmICggWyAnMCcsICdmYWxzZScsIGZhbHNlIF0uaW5kZXhPZiggdmFsdWUgKSAhPT0gLTEgKSB7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIH1cblxuICAgIHJldHVybiAhIXZhbHVlO1xuXG4gIH1cblxufSJdfQ==