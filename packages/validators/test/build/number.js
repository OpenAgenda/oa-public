"use strict";

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
integer: require( 'react-form-components/validators/integer' )
state: validators.integer( { field: 'state', min: 0, max: 1, default: 1 } )
*/

module.exports = function (config) {

  var params = _utils2.default.extend({
    field: false, // required
    min: null, // minus infinity if defined
    max: null, // infinity and beyond?
    default: undefined, // if set, no input cleans to this
    optional: true
  }, config || {});

  return _utils2.default.extend(validate, {
    type: 'number',
    field: params.field
  });

  function validate(value) {

    var clean = void 0;

    if (typeof value == 'string' && value.length) {

      clean = parseInt(value, 10);
    } else if (typeof value === 'number') {

      clean = value;
    }

    // we have a clean value, we can check if it fits
    // in what we want.

    if (clean === undefined && params.default !== undefined) {

      return params.default;
    }

    if (clean === undefined && params.optional) {

      return null;
    }

    if (clean === undefined && !params.optional) {

      throw [{
        field: validate.field,
        code: 'required',
        message: 'a number is required',
        origin: value
      }];
    }

    if (isNaN(clean)) {

      throw [{
        field: validate.field,
        code: 'number.invalid',
        message: 'not a number',
        origin: value
      }];
    }

    if (params.min !== null && clean < params.min) {

      throw [{
        field: validate.field,
        code: 'number.toosmall',
        message: 'the number is too small',
        values: {
          min: params.min
        },
        origin: value
      }];
    }

    if (params.max !== null && clean > params.max) {

      throw [{
        field: params.field,
        code: 'number.toobig',
        message: 'the number is too big',
        values: {
          max: params.max
        },
        origin: value
      }];
    }

    return clean;
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9udW1iZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7Ozs7OztBQUVBOzs7OztBQUtBLE9BQU8sT0FBUCxHQUFpQixrQkFBVTs7QUFFekIsTUFBSSxTQUFTLGdCQUFNLE1BQU4sQ0FBYztBQUN6QixXQUFPLEtBRGtCLEVBQ1g7QUFDZCxTQUFLLElBRm9CLEVBRWQ7QUFDWCxTQUFLLElBSG9CLEVBR2Q7QUFDWCxhQUFTLFNBSmdCLEVBSUw7QUFDcEIsY0FBVTtBQUxlLEdBQWQsRUFNVixVQUFVLEVBTkEsQ0FBYjs7QUFRQSxTQUFPLGdCQUFNLE1BQU4sQ0FBYyxRQUFkLEVBQXdCO0FBQzdCLFVBQU0sUUFEdUI7QUFFN0IsV0FBTyxPQUFPO0FBRmUsR0FBeEIsQ0FBUDs7QUFLQSxXQUFTLFFBQVQsQ0FBbUIsS0FBbkIsRUFBMkI7O0FBRXpCLFFBQUksY0FBSjs7QUFFQSxRQUFLLE9BQU8sS0FBUCxJQUFnQixRQUFoQixJQUE0QixNQUFNLE1BQXZDLEVBQWdEOztBQUU5QyxjQUFRLFNBQVUsS0FBVixFQUFpQixFQUFqQixDQUFSO0FBRUQsS0FKRCxNQUlPLElBQUssT0FBTyxLQUFQLEtBQWlCLFFBQXRCLEVBQWlDOztBQUV0QyxjQUFRLEtBQVI7QUFFRDs7QUFFRDtBQUNBOztBQUVBLFFBQUssVUFBVSxTQUFWLElBQXVCLE9BQU8sT0FBUCxLQUFtQixTQUEvQyxFQUEyRDs7QUFFekQsYUFBTyxPQUFPLE9BQWQ7QUFFRDs7QUFFRCxRQUFLLFVBQVUsU0FBVixJQUF1QixPQUFPLFFBQW5DLEVBQThDOztBQUU1QyxhQUFPLElBQVA7QUFFRDs7QUFFRCxRQUFLLFVBQVUsU0FBVixJQUF1QixDQUFDLE9BQU8sUUFBcEMsRUFBK0M7O0FBRTdDLFlBQU0sQ0FBRTtBQUNOLGVBQU8sU0FBUyxLQURWO0FBRU4sY0FBTSxVQUZBO0FBR04saUJBQVMsc0JBSEg7QUFJTixnQkFBUTtBQUpGLE9BQUYsQ0FBTjtBQU9EOztBQUVELFFBQUssTUFBTyxLQUFQLENBQUwsRUFBc0I7O0FBRXBCLFlBQU0sQ0FBRTtBQUNOLGVBQU8sU0FBUyxLQURWO0FBRU4sY0FBTSxnQkFGQTtBQUdOLGlCQUFTLGNBSEg7QUFJTixnQkFBUTtBQUpGLE9BQUYsQ0FBTjtBQU9EOztBQUVELFFBQUssT0FBTyxHQUFQLEtBQWUsSUFBZixJQUF1QixRQUFRLE9BQU8sR0FBM0MsRUFBaUQ7O0FBRS9DLFlBQU0sQ0FBRTtBQUNOLGVBQU8sU0FBUyxLQURWO0FBRU4sY0FBTSxpQkFGQTtBQUdOLGlCQUFTLHlCQUhIO0FBSU4sZ0JBQVE7QUFDTixlQUFLLE9BQU87QUFETixTQUpGO0FBT04sZ0JBQVE7QUFQRixPQUFGLENBQU47QUFVRDs7QUFFRCxRQUFLLE9BQU8sR0FBUCxLQUFlLElBQWYsSUFBdUIsUUFBUSxPQUFPLEdBQTNDLEVBQWlEOztBQUUvQyxZQUFNLENBQUU7QUFDTixlQUFPLE9BQU8sS0FEUjtBQUVOLGNBQU0sZUFGQTtBQUdOLGlCQUFTLHVCQUhIO0FBSU4sZ0JBQVE7QUFDTixlQUFLLE9BQU87QUFETixTQUpGO0FBT04sZ0JBQVE7QUFQRixPQUFGLENBQU47QUFVRDs7QUFFRCxXQUFPLEtBQVA7QUFFRDtBQUVGLENBbEdEIiwiZmlsZSI6Im51bWJlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgdXRpbHMgZnJvbSAndXRpbHMnO1xuXG4vKlxuaW50ZWdlcjogcmVxdWlyZSggJ3JlYWN0LWZvcm0tY29tcG9uZW50cy92YWxpZGF0b3JzL2ludGVnZXInIClcbnN0YXRlOiB2YWxpZGF0b3JzLmludGVnZXIoIHsgZmllbGQ6ICdzdGF0ZScsIG1pbjogMCwgbWF4OiAxLCBkZWZhdWx0OiAxIH0gKVxuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjb25maWcgPT4ge1xuXG4gIGxldCBwYXJhbXMgPSB1dGlscy5leHRlbmQoIHtcbiAgICBmaWVsZDogZmFsc2UsIC8vIHJlcXVpcmVkXG4gICAgbWluOiBudWxsLCAvLyBtaW51cyBpbmZpbml0eSBpZiBkZWZpbmVkXG4gICAgbWF4OiBudWxsLCAvLyBpbmZpbml0eSBhbmQgYmV5b25kP1xuICAgIGRlZmF1bHQ6IHVuZGVmaW5lZCwgLy8gaWYgc2V0LCBubyBpbnB1dCBjbGVhbnMgdG8gdGhpc1xuICAgIG9wdGlvbmFsOiB0cnVlXG4gIH0sIGNvbmZpZyB8fCB7fSApO1xuXG4gIHJldHVybiB1dGlscy5leHRlbmQoIHZhbGlkYXRlLCB7XG4gICAgdHlwZTogJ251bWJlcicsXG4gICAgZmllbGQ6IHBhcmFtcy5maWVsZFxuICB9ICk7XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGUoIHZhbHVlICkge1xuXG4gICAgbGV0IGNsZWFuO1xuXG4gICAgaWYgKCB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgJiYgdmFsdWUubGVuZ3RoICkge1xuXG4gICAgICBjbGVhbiA9IHBhcnNlSW50KCB2YWx1ZSwgMTAgKTtcblxuICAgIH0gZWxzZSBpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgKSB7XG5cbiAgICAgIGNsZWFuID0gdmFsdWU7XG5cbiAgICB9XG5cbiAgICAvLyB3ZSBoYXZlIGEgY2xlYW4gdmFsdWUsIHdlIGNhbiBjaGVjayBpZiBpdCBmaXRzXG4gICAgLy8gaW4gd2hhdCB3ZSB3YW50LlxuXG4gICAgaWYgKCBjbGVhbiA9PT0gdW5kZWZpbmVkICYmIHBhcmFtcy5kZWZhdWx0ICE9PSB1bmRlZmluZWQgKSB7XG5cbiAgICAgIHJldHVybiBwYXJhbXMuZGVmYXVsdDtcblxuICAgIH1cblxuICAgIGlmICggY2xlYW4gPT09IHVuZGVmaW5lZCAmJiBwYXJhbXMub3B0aW9uYWwgKSB7XG5cbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgfVxuXG4gICAgaWYgKCBjbGVhbiA9PT0gdW5kZWZpbmVkICYmICFwYXJhbXMub3B0aW9uYWwgKSB7XG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBmaWVsZDogdmFsaWRhdGUuZmllbGQsXG4gICAgICAgIGNvZGU6ICdyZXF1aXJlZCcsXG4gICAgICAgIG1lc3NhZ2U6ICdhIG51bWJlciBpcyByZXF1aXJlZCcsXG4gICAgICAgIG9yaWdpbjogdmFsdWVcbiAgICAgIH0gXTtcblxuICAgIH1cblxuICAgIGlmICggaXNOYU4oIGNsZWFuICkgKSB7XG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBmaWVsZDogdmFsaWRhdGUuZmllbGQsXG4gICAgICAgIGNvZGU6ICdudW1iZXIuaW52YWxpZCcsXG4gICAgICAgIG1lc3NhZ2U6ICdub3QgYSBudW1iZXInLFxuICAgICAgICBvcmlnaW46IHZhbHVlXG4gICAgICB9IF07XG5cbiAgICB9XG5cbiAgICBpZiAoIHBhcmFtcy5taW4gIT09IG51bGwgJiYgY2xlYW4gPCBwYXJhbXMubWluICkge1xuXG4gICAgICB0aHJvdyBbIHtcbiAgICAgICAgZmllbGQ6IHZhbGlkYXRlLmZpZWxkLFxuICAgICAgICBjb2RlOiAnbnVtYmVyLnRvb3NtYWxsJyxcbiAgICAgICAgbWVzc2FnZTogJ3RoZSBudW1iZXIgaXMgdG9vIHNtYWxsJyxcbiAgICAgICAgdmFsdWVzOiB7XG4gICAgICAgICAgbWluOiBwYXJhbXMubWluXG4gICAgICAgIH0sXG4gICAgICAgIG9yaWdpbjogdmFsdWVcbiAgICAgIH0gXTtcblxuICAgIH1cblxuICAgIGlmICggcGFyYW1zLm1heCAhPT0gbnVsbCAmJiBjbGVhbiA+IHBhcmFtcy5tYXggKSB7XG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBmaWVsZDogcGFyYW1zLmZpZWxkLFxuICAgICAgICBjb2RlOiAnbnVtYmVyLnRvb2JpZycsXG4gICAgICAgIG1lc3NhZ2U6ICd0aGUgbnVtYmVyIGlzIHRvbyBiaWcnLFxuICAgICAgICB2YWx1ZXM6IHtcbiAgICAgICAgICBtYXg6IHBhcmFtcy5tYXhcbiAgICAgICAgfSxcbiAgICAgICAgb3JpZ2luOiB2YWx1ZVxuICAgICAgfSBdO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFuO1xuXG4gIH1cblxufSJdfQ==