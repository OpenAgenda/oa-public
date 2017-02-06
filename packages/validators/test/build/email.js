"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var emailRgx = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;

exports.default = function (config) {

  var params = (0, _extend2.default)({
    field: undefined,
    error: {
      code: 'email.invalid',
      message: 'email is not valid'
    },
    optional: true,
    type: 'email'
  }, config || {}),
      validator = (0, _extend2.default)(validate, {
    type: 'email',
    field: params.field
  });

  return params.list ? (0, _listify2.default)(validator, params) : validator;

  function validate(value) {

    var clean = typeof value === 'string' ? value.trim() : '';

    if (!value && params.optional) {

      return null;
    }

    if (clean.indexOf(' ') !== -1 || !emailRgx.test(clean)) {

      throw [{
        field: params.field,
        code: params.error.code,
        message: params.error.message,
        origin: value
      }];
    }

    return clean;
  }
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lbWFpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FBRUE7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxXQUFXLDBJQUFqQjs7a0JBRWUsa0JBQVU7O0FBRXZCLE1BQU0sU0FBUyxzQkFBUTtBQUNyQixXQUFPLFNBRGM7QUFFckIsV0FBTztBQUNMLFlBQU0sZUFERDtBQUVMLGVBQVM7QUFGSixLQUZjO0FBTXJCLGNBQVUsSUFOVztBQU9yQixVQUFNO0FBUGUsR0FBUixFQVFaLFVBQVUsRUFSRSxDQUFmO0FBQUEsTUFVQSxZQUFZLHNCQUFRLFFBQVIsRUFBa0I7QUFDNUIsVUFBTSxPQURzQjtBQUU1QixXQUFPLE9BQU87QUFGYyxHQUFsQixDQVZaOztBQWVBLFNBQU8sT0FBTyxJQUFQLEdBQWMsdUJBQVMsU0FBVCxFQUFvQixNQUFwQixDQUFkLEdBQTZDLFNBQXBEOztBQUVBLFdBQVMsUUFBVCxDQUFtQixLQUFuQixFQUEyQjs7QUFFekIsUUFBSSxRQUFRLE9BQU8sS0FBUCxLQUFpQixRQUFqQixHQUE0QixNQUFNLElBQU4sRUFBNUIsR0FBMkMsRUFBdkQ7O0FBRUEsUUFBSyxDQUFDLEtBQUQsSUFBVSxPQUFPLFFBQXRCLEVBQWlDOztBQUUvQixhQUFPLElBQVA7QUFFRDs7QUFFRCxRQUFLLE1BQU0sT0FBTixDQUFlLEdBQWYsTUFBeUIsQ0FBQyxDQUExQixJQUErQixDQUFDLFNBQVMsSUFBVCxDQUFlLEtBQWYsQ0FBckMsRUFBOEQ7O0FBRTVELFlBQU0sQ0FBRTtBQUNOLGVBQU8sT0FBTyxLQURSO0FBRU4sY0FBTSxPQUFPLEtBQVAsQ0FBYSxJQUZiO0FBR04saUJBQVMsT0FBTyxLQUFQLENBQWEsT0FIaEI7QUFJTixnQkFBUTtBQUpGLE9BQUYsQ0FBTjtBQU9EOztBQUVELFdBQU8sS0FBUDtBQUVEO0FBRUYsQyIsImZpbGUiOiJlbWFpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2xvZGFzaC9leHRlbmQnO1xuaW1wb3J0IGxpc3RpZnkgZnJvbSAnLi9saXN0aWZ5JztcblxuY29uc3QgZW1haWxSZ3ggPSAvW2EtejAtOSEjJCUmJyorXFwvPT9eX2B7fH1+LV0rKD86XFwuW2EtejAtOSEjJCUmJyorXFwvPT9eX2B7fH1+LV0rKSpAKD86W2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pP1xcLikrW2EtejAtOV0oPzpbYS16MC05LV0qW2EtejAtOV0pPy9pO1xuXG5leHBvcnQgZGVmYXVsdCBjb25maWcgPT4ge1xuXG4gIGNvbnN0IHBhcmFtcyA9IGV4dGVuZCgge1xuICAgIGZpZWxkOiB1bmRlZmluZWQsXG4gICAgZXJyb3I6IHtcbiAgICAgIGNvZGU6ICdlbWFpbC5pbnZhbGlkJyxcbiAgICAgIG1lc3NhZ2U6ICdlbWFpbCBpcyBub3QgdmFsaWQnXG4gICAgfSxcbiAgICBvcHRpb25hbDogdHJ1ZSxcbiAgICB0eXBlOiAnZW1haWwnXG4gIH0sIGNvbmZpZyB8fCB7fSApLFxuXG4gIHZhbGlkYXRvciA9IGV4dGVuZCggdmFsaWRhdGUsIHtcbiAgICB0eXBlOiAnZW1haWwnLFxuICAgIGZpZWxkOiBwYXJhbXMuZmllbGRcbiAgfSApO1xuXG4gIHJldHVybiBwYXJhbXMubGlzdCA/IGxpc3RpZnkoIHZhbGlkYXRvciwgcGFyYW1zICkgOiB2YWxpZGF0b3I7XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGUoIHZhbHVlICkge1xuXG4gICAgbGV0IGNsZWFuID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnRyaW0oKSA6ICcnO1xuXG4gICAgaWYgKCAhdmFsdWUgJiYgcGFyYW1zLm9wdGlvbmFsICkge1xuXG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIH1cblxuICAgIGlmICggY2xlYW4uaW5kZXhPZiggJyAnICkgIT09IC0xIHx8ICFlbWFpbFJneC50ZXN0KCBjbGVhbiApICkge1xuXG4gICAgICB0aHJvdyBbIHtcbiAgICAgICAgZmllbGQ6IHBhcmFtcy5maWVsZCxcbiAgICAgICAgY29kZTogcGFyYW1zLmVycm9yLmNvZGUsXG4gICAgICAgIG1lc3NhZ2U6IHBhcmFtcy5lcnJvci5tZXNzYWdlLFxuICAgICAgICBvcmlnaW46IHZhbHVlXG4gICAgICB9IF07ICAgICAgXG5cbiAgICB9IFxuXG4gICAgcmV0dXJuIGNsZWFuO1xuXG4gIH1cblxufSJdfQ==