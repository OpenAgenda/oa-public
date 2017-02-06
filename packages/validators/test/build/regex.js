"use strict";

var utils = require('utils');

module.exports = function (config) {

  var params = utils.extend({
    optional: false,
    field: false, // required
    regex: false, // required
    error: { // replace with something more specific
      code: 'regex.mismatch',
      message: 'regex does not match'
    },
    clean: false, // if true result of regex is clean value
    trim: true,
    type: false,
    min: null,
    max: null
  }, config || {}),
      validator = function validator(value) {

    var clean = value ? value + '' : null;

    if (params.optional && (!clean || !clean.length)) {

      return clean;
    }

    if (!params.optional && !clean) {

      throw [{
        origin: value,
        field: params.field,
        code: 'required',
        message: 'value must not be empty'
      }];
    }

    if (typeof clean == 'string' && params.trim) {

      clean = clean.trim();
    }

    if (params.min !== null && clean.length < params.min) {

      throw [{
        origin: value,
        field: params.field,
        code: 'toosmall',
        message: 'value is too short',
        values: {
          min: params.min,
          max: params.max
        }
      }];
    }

    if (params.max !== null && clean.length > params.max) {

      throw [{
        origin: value,
        field: params.field,
        code: 'toolong',
        message: 'value is too long',
        values: {
          min: params.min,
          max: params.max
        }
      }];
    }

    if (!params.regex.test(clean)) {

      throw [utils.extend({
        origin: value,
        field: params.field
      }, params.error)];
    }

    return params.clean ? clean.match(params.regex)[0] : clean;
  };

  if (params.type) {

    validator.type = params.type;
  }

  if (params.field) {

    validator.field = params.field;
  }

  return validator;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWdleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxJQUFJLFFBQVEsUUFBUyxPQUFULENBQVo7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVUsTUFBVixFQUFtQjs7QUFFbEMsTUFBSSxTQUFTLE1BQU0sTUFBTixDQUFjO0FBQ3pCLGNBQVUsS0FEZTtBQUV6QixXQUFPLEtBRmtCLEVBRVg7QUFDZCxXQUFPLEtBSGtCLEVBR1g7QUFDZCxXQUFPLEVBQUU7QUFDUCxZQUFNLGdCQUREO0FBRUwsZUFBUztBQUZKLEtBSmtCO0FBUXpCLFdBQU8sS0FSa0IsRUFRWDtBQUNkLFVBQU0sSUFUbUI7QUFVekIsVUFBTSxLQVZtQjtBQVd6QixTQUFLLElBWG9CO0FBWXpCLFNBQUs7QUFab0IsR0FBZCxFQWFWLFVBQVUsRUFiQSxDQUFiO0FBQUEsTUFlQSxZQUFZLFNBQVosU0FBWSxDQUFVLEtBQVYsRUFBa0I7O0FBRTVCLFFBQUksUUFBUSxRQUFVLFFBQVEsRUFBbEIsR0FBeUIsSUFBckM7O0FBRUEsUUFBSyxPQUFPLFFBQVAsS0FBcUIsQ0FBQyxLQUFELElBQVUsQ0FBQyxNQUFNLE1BQXRDLENBQUwsRUFBc0Q7O0FBRXBELGFBQU8sS0FBUDtBQUVEOztBQUVELFFBQUssQ0FBQyxPQUFPLFFBQVIsSUFBb0IsQ0FBQyxLQUExQixFQUFrQzs7QUFFaEMsWUFBTSxDQUFFO0FBQ04sZ0JBQVEsS0FERjtBQUVOLGVBQU8sT0FBTyxLQUZSO0FBR04sY0FBTSxVQUhBO0FBSU4saUJBQVM7QUFKSCxPQUFGLENBQU47QUFPRDs7QUFFRCxRQUFLLE9BQU8sS0FBUCxJQUFnQixRQUFoQixJQUE0QixPQUFPLElBQXhDLEVBQStDOztBQUU3QyxjQUFRLE1BQU0sSUFBTixFQUFSO0FBRUQ7O0FBRUQsUUFBSyxPQUFPLEdBQVAsS0FBZSxJQUFmLElBQXVCLE1BQU0sTUFBTixHQUFlLE9BQU8sR0FBbEQsRUFBd0Q7O0FBRXRELFlBQU0sQ0FBRTtBQUNOLGdCQUFRLEtBREY7QUFFTixlQUFPLE9BQU8sS0FGUjtBQUdOLGNBQU0sVUFIQTtBQUlOLGlCQUFTLG9CQUpIO0FBS04sZ0JBQVE7QUFDTixlQUFLLE9BQU8sR0FETjtBQUVOLGVBQUssT0FBTztBQUZOO0FBTEYsT0FBRixDQUFOO0FBV0Q7O0FBRUQsUUFBSyxPQUFPLEdBQVAsS0FBZSxJQUFmLElBQXVCLE1BQU0sTUFBTixHQUFlLE9BQU8sR0FBbEQsRUFBd0Q7O0FBRXRELFlBQU0sQ0FBRTtBQUNOLGdCQUFRLEtBREY7QUFFTixlQUFPLE9BQU8sS0FGUjtBQUdOLGNBQU0sU0FIQTtBQUlOLGlCQUFTLG1CQUpIO0FBS04sZ0JBQVE7QUFDTixlQUFLLE9BQU8sR0FETjtBQUVOLGVBQUssT0FBTztBQUZOO0FBTEYsT0FBRixDQUFOO0FBV0Q7O0FBRUQsUUFBSyxDQUFDLE9BQU8sS0FBUCxDQUFhLElBQWIsQ0FBbUIsS0FBbkIsQ0FBTixFQUFtQzs7QUFFakMsWUFBTSxDQUFFLE1BQU0sTUFBTixDQUFjO0FBQ3BCLGdCQUFRLEtBRFk7QUFFcEIsZUFBTyxPQUFPO0FBRk0sT0FBZCxFQUdMLE9BQU8sS0FIRixDQUFGLENBQU47QUFLRDs7QUFFRCxXQUFPLE9BQU8sS0FBUCxHQUFlLE1BQU0sS0FBTixDQUFhLE9BQU8sS0FBcEIsRUFBNkIsQ0FBN0IsQ0FBZixHQUFrRCxLQUF6RDtBQUVELEdBbkZEOztBQXFGQSxNQUFLLE9BQU8sSUFBWixFQUFtQjs7QUFFakIsY0FBVSxJQUFWLEdBQWlCLE9BQU8sSUFBeEI7QUFFRDs7QUFFRCxNQUFLLE9BQU8sS0FBWixFQUFvQjs7QUFFbEIsY0FBVSxLQUFWLEdBQWtCLE9BQU8sS0FBekI7QUFFRDs7QUFFRCxTQUFPLFNBQVA7QUFFRCxDQXJHRCIsImZpbGUiOiJyZWdleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCAndXRpbHMnICk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGNvbmZpZyApIHtcblxuICB2YXIgcGFyYW1zID0gdXRpbHMuZXh0ZW5kKCB7XG4gICAgb3B0aW9uYWw6IGZhbHNlLFxuICAgIGZpZWxkOiBmYWxzZSwgLy8gcmVxdWlyZWRcbiAgICByZWdleDogZmFsc2UsIC8vIHJlcXVpcmVkXG4gICAgZXJyb3I6IHsgLy8gcmVwbGFjZSB3aXRoIHNvbWV0aGluZyBtb3JlIHNwZWNpZmljXG4gICAgICBjb2RlOiAncmVnZXgubWlzbWF0Y2gnLFxuICAgICAgbWVzc2FnZTogJ3JlZ2V4IGRvZXMgbm90IG1hdGNoJ1xuICAgIH0sXG4gICAgY2xlYW46IGZhbHNlLCAvLyBpZiB0cnVlIHJlc3VsdCBvZiByZWdleCBpcyBjbGVhbiB2YWx1ZVxuICAgIHRyaW06IHRydWUsXG4gICAgdHlwZTogZmFsc2UsXG4gICAgbWluOiBudWxsLFxuICAgIG1heDogbnVsbFxuICB9LCBjb25maWcgfHwge30gKSxcblxuICB2YWxpZGF0b3IgPSBmdW5jdGlvbiggdmFsdWUgKSB7XG5cbiAgICB2YXIgY2xlYW4gPSB2YWx1ZSA/ICggdmFsdWUgKyAnJyApIDogbnVsbDtcblxuICAgIGlmICggcGFyYW1zLm9wdGlvbmFsICYmICggIWNsZWFuIHx8ICFjbGVhbi5sZW5ndGggKSApIHtcblxuICAgICAgcmV0dXJuIGNsZWFuO1xuXG4gICAgfVxuXG4gICAgaWYgKCAhcGFyYW1zLm9wdGlvbmFsICYmICFjbGVhbiApIHtcblxuICAgICAgdGhyb3cgWyB7XG4gICAgICAgIG9yaWdpbjogdmFsdWUsXG4gICAgICAgIGZpZWxkOiBwYXJhbXMuZmllbGQsXG4gICAgICAgIGNvZGU6ICdyZXF1aXJlZCcsXG4gICAgICAgIG1lc3NhZ2U6ICd2YWx1ZSBtdXN0IG5vdCBiZSBlbXB0eSdcbiAgICAgIH0gXTtcblxuICAgIH1cblxuICAgIGlmICggdHlwZW9mIGNsZWFuID09ICdzdHJpbmcnICYmIHBhcmFtcy50cmltICkge1xuXG4gICAgICBjbGVhbiA9IGNsZWFuLnRyaW0oKTtcblxuICAgIH1cblxuICAgIGlmICggcGFyYW1zLm1pbiAhPT0gbnVsbCAmJiBjbGVhbi5sZW5ndGggPCBwYXJhbXMubWluICkge1xuXG4gICAgICB0aHJvdyBbIHtcbiAgICAgICAgb3JpZ2luOiB2YWx1ZSxcbiAgICAgICAgZmllbGQ6IHBhcmFtcy5maWVsZCxcbiAgICAgICAgY29kZTogJ3Rvb3NtYWxsJyxcbiAgICAgICAgbWVzc2FnZTogJ3ZhbHVlIGlzIHRvbyBzaG9ydCcsXG4gICAgICAgIHZhbHVlczoge1xuICAgICAgICAgIG1pbjogcGFyYW1zLm1pbixcbiAgICAgICAgICBtYXg6IHBhcmFtcy5tYXhcbiAgICAgICAgfVxuICAgICAgfSBdO1xuXG4gICAgfVxuXG4gICAgaWYgKCBwYXJhbXMubWF4ICE9PSBudWxsICYmIGNsZWFuLmxlbmd0aCA+IHBhcmFtcy5tYXggKSB7XG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBvcmlnaW46IHZhbHVlLFxuICAgICAgICBmaWVsZDogcGFyYW1zLmZpZWxkLFxuICAgICAgICBjb2RlOiAndG9vbG9uZycsXG4gICAgICAgIG1lc3NhZ2U6ICd2YWx1ZSBpcyB0b28gbG9uZycsXG4gICAgICAgIHZhbHVlczoge1xuICAgICAgICAgIG1pbjogcGFyYW1zLm1pbixcbiAgICAgICAgICBtYXg6IHBhcmFtcy5tYXhcbiAgICAgICAgfVxuICAgICAgfV1cblxuICAgIH1cblxuICAgIGlmICggIXBhcmFtcy5yZWdleC50ZXN0KCBjbGVhbiApICkge1xuXG4gICAgICB0aHJvdyBbIHV0aWxzLmV4dGVuZCgge1xuICAgICAgICBvcmlnaW46IHZhbHVlLFxuICAgICAgICBmaWVsZDogcGFyYW1zLmZpZWxkXG4gICAgICB9LCBwYXJhbXMuZXJyb3IgKSBdO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmFtcy5jbGVhbiA/IGNsZWFuLm1hdGNoKCBwYXJhbXMucmVnZXggKVsgMCBdIDogY2xlYW47XG5cbiAgfTtcblxuICBpZiAoIHBhcmFtcy50eXBlICkge1xuXG4gICAgdmFsaWRhdG9yLnR5cGUgPSBwYXJhbXMudHlwZTtcblxuICB9XG5cbiAgaWYgKCBwYXJhbXMuZmllbGQgKSB7XG5cbiAgICB2YWxpZGF0b3IuZmllbGQgPSBwYXJhbXMuZmllbGQ7XG5cbiAgfVxuXG4gIHJldHVybiB2YWxpZGF0b3I7XG5cbn0iXX0=