"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extend = require('lodash/extend');

var _extend2 = _interopRequireDefault(_extend);

var _listify = require('./listify');

var _listify2 = _interopRequireDefault(_listify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {

  var params = (0, _extend2.default)({
    field: undefined,
    type: 'pass',
    list: false
  }, config || {}),
      validator = (0, _extend2.default)(function (v) {
    return v;
  }, {
    type: 'pass',
    field: params.field
  });

  return params.list ? (0, _listify2.default)(validator, params) : validator;
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wYXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7a0JBRWUsa0JBQVU7O0FBRXZCLE1BQU0sU0FBUyxzQkFBUTtBQUNyQixXQUFPLFNBRGM7QUFFckIsVUFBTSxNQUZlO0FBR3JCLFVBQU07QUFIZSxHQUFSLEVBSVosVUFBVSxFQUpFLENBQWY7QUFBQSxNQU1BLFlBQVksc0JBQVE7QUFBQSxXQUFLLENBQUw7QUFBQSxHQUFSLEVBQWdCO0FBQzFCLFVBQU0sTUFEb0I7QUFFMUIsV0FBTyxPQUFPO0FBRlksR0FBaEIsQ0FOWjs7QUFXQSxTQUFPLE9BQU8sSUFBUCxHQUFjLHVCQUFTLFNBQVQsRUFBb0IsTUFBcEIsQ0FBZCxHQUE2QyxTQUFwRDtBQUVELEMiLCJmaWxlIjoicGFzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgZXh0ZW5kIGZyb20gJ2xvZGFzaC9leHRlbmQnO1xuaW1wb3J0IGxpc3RpZnkgZnJvbSAnLi9saXN0aWZ5JztcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnID0+IHtcblxuICBjb25zdCBwYXJhbXMgPSBleHRlbmQoIHtcbiAgICBmaWVsZDogdW5kZWZpbmVkLFxuICAgIHR5cGU6ICdwYXNzJyxcbiAgICBsaXN0OiBmYWxzZVxuICB9LCBjb25maWfCoHx8IHt9ICksXG5cbiAgdmFsaWRhdG9yID0gZXh0ZW5kKCB2ID0+IHYsIHtcbiAgICB0eXBlOiAncGFzcycsXG4gICAgZmllbGQ6IHBhcmFtcy5maWVsZFxuICB9ICk7XG5cbiAgcmV0dXJuIHBhcmFtcy5saXN0ID8gbGlzdGlmeSggdmFsaWRhdG9yLCBwYXJhbXMgKSA6IHZhbGlkYXRvcjsgIFxuXG59Il19