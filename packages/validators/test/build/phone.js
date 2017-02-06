"use strict";

var rgx = require('./regex');

module.exports = function (config) {

  return rgx({
    optional: config ? config.optional : false,
    field: config ? config.field : undefined,
    regex: /^(\+|)[\d\s]+$/,
    error: {
      code: 'phone.invalid',
      message: 'value is not a phone number'
    },
    type: 'phone'
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9waG9uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxJQUFJLE1BQU0sUUFBUyxTQUFULENBQVY7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVUsTUFBVixFQUFtQjs7QUFFbEMsU0FBTyxJQUFLO0FBQ1YsY0FBVSxTQUFTLE9BQU8sUUFBaEIsR0FBMkIsS0FEM0I7QUFFVixXQUFPLFNBQVMsT0FBTyxLQUFoQixHQUF3QixTQUZyQjtBQUdWLFdBQU8sZ0JBSEc7QUFJVixXQUFPO0FBQ0wsWUFBTSxlQUREO0FBRUwsZUFBUztBQUZKLEtBSkc7QUFRVixVQUFNO0FBUkksR0FBTCxDQUFQO0FBV0QsQ0FiRCIsImZpbGUiOiJwaG9uZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgcmd4ID0gcmVxdWlyZSggJy4vcmVnZXgnICk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGNvbmZpZyApIHtcblxuICByZXR1cm4gcmd4KCB7XG4gICAgb3B0aW9uYWw6IGNvbmZpZyA/IGNvbmZpZy5vcHRpb25hbCA6IGZhbHNlLFxuICAgIGZpZWxkOiBjb25maWcgPyBjb25maWcuZmllbGQgOiB1bmRlZmluZWQsXG4gICAgcmVnZXg6IC9eKFxcK3wpW1xcZFxcc10rJC8sXG4gICAgZXJyb3I6IHtcbiAgICAgIGNvZGU6ICdwaG9uZS5pbnZhbGlkJyxcbiAgICAgIG1lc3NhZ2U6ICd2YWx1ZSBpcyBub3QgYSBwaG9uZSBudW1iZXInXG4gICAgfSxcbiAgICB0eXBlOiAncGhvbmUnXG4gIH0gKTtcblxufSJdfQ==