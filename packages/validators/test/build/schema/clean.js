"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = clean;

function clean(schema) {

  if (_isLeaf(schema)) {

    return _utils2.default.extend({}, schema);
  }

  var cleanSchema = { fields: {}, list: false, type: 'schema' },
      schemaFields = void 0;

  if (_isNormalized(schema)) {

    _utils2.default.extend(cleanSchema, schema);

    schemaFields = schema.fields;
  } else {

    schemaFields = schema;
  }

  Object.keys(schemaFields).forEach(function (branchKey) {

    cleanSchema.fields[branchKey] = clean(schemaFields[branchKey]);
  });

  return cleanSchema;
}

function _isNormalized(schema) {

  if (schema.fields) return true;

  return false;
}

function _isLeaf(node) {

  var is = false;

  if (node && node.type && _typeof(node.type) !== 'object' && node.type !== 'schema') {

    is = true;
  } else {

    is = !Object.keys(node || {}).filter(function (k) {

      return _typeof(node[k]) === 'object' && node[k] !== null;
    }).length;
  }

  return is;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zY2hlbWEvY2xlYW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFFQTs7Ozs7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLEtBQWpCOztBQUVBLFNBQVMsS0FBVCxDQUFnQixNQUFoQixFQUF5Qjs7QUFFdkIsTUFBSyxRQUFTLE1BQVQsQ0FBTCxFQUF5Qjs7QUFFdkIsV0FBTyxnQkFBTSxNQUFOLENBQWMsRUFBZCxFQUFrQixNQUFsQixDQUFQO0FBRUQ7O0FBRUQsTUFBSSxjQUFjLEVBQUUsUUFBUSxFQUFWLEVBQWMsTUFBTSxLQUFwQixFQUEyQixNQUFNLFFBQWpDLEVBQWxCO0FBQUEsTUFFQSxxQkFGQTs7QUFJQSxNQUFLLGNBQWUsTUFBZixDQUFMLEVBQStCOztBQUU3QixvQkFBTSxNQUFOLENBQWMsV0FBZCxFQUEyQixNQUEzQjs7QUFFQSxtQkFBZSxPQUFPLE1BQXRCO0FBRUQsR0FORCxNQU1POztBQUVMLG1CQUFlLE1BQWY7QUFFRDs7QUFFRCxTQUFPLElBQVAsQ0FBYSxZQUFiLEVBQTRCLE9BQTVCLENBQXFDLHFCQUFhOztBQUVoRCxnQkFBWSxNQUFaLENBQW9CLFNBQXBCLElBQWtDLE1BQU8sYUFBYyxTQUFkLENBQVAsQ0FBbEM7QUFFRCxHQUpEOztBQU1BLFNBQU8sV0FBUDtBQUVEOztBQUdELFNBQVMsYUFBVCxDQUF3QixNQUF4QixFQUFpQzs7QUFFL0IsTUFBSyxPQUFPLE1BQVosRUFBcUIsT0FBTyxJQUFQOztBQUVyQixTQUFPLEtBQVA7QUFFRDs7QUFHRCxTQUFTLE9BQVQsQ0FBa0IsSUFBbEIsRUFBeUI7O0FBRXZCLE1BQUksS0FBSyxLQUFUOztBQUVBLE1BQUssUUFBUSxLQUFLLElBQWIsSUFBcUIsUUFBTyxLQUFLLElBQVosTUFBcUIsUUFBMUMsSUFBc0QsS0FBSyxJQUFMLEtBQWMsUUFBekUsRUFBb0Y7O0FBRWxGLFNBQUssSUFBTDtBQUVELEdBSkQsTUFJTzs7QUFFTCxTQUFLLENBQUMsT0FBTyxJQUFQLENBQWEsUUFBUSxFQUFyQixFQUEwQixNQUExQixDQUFrQyxhQUFLOztBQUUzQyxhQUFTLFFBQU8sS0FBTSxDQUFOLENBQVAsTUFBcUIsUUFBckIsSUFBaUMsS0FBTSxDQUFOLE1BQWMsSUFBeEQ7QUFFRCxLQUpLLEVBSUYsTUFKSjtBQU1EOztBQUVELFNBQU8sRUFBUDtBQUVEIiwiZmlsZSI6ImNsZWFuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB1dGlscyBmcm9tICd1dGlscyc7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xlYW47XG5cbmZ1bmN0aW9uIGNsZWFuKCBzY2hlbWEgKSB7XG4gIFxuICBpZiAoIF9pc0xlYWYoIHNjaGVtYSApICkge1xuXG4gICAgcmV0dXJuIHV0aWxzLmV4dGVuZCgge30sIHNjaGVtYSApO1xuXG4gIH1cblxuICBsZXQgY2xlYW5TY2hlbWEgPSB7IGZpZWxkczoge30sIGxpc3Q6IGZhbHNlLCB0eXBlOiAnc2NoZW1hJyB9LFxuXG4gIHNjaGVtYUZpZWxkcztcblxuICBpZiAoIF9pc05vcm1hbGl6ZWQoIHNjaGVtYSApICkge1xuXG4gICAgdXRpbHMuZXh0ZW5kKCBjbGVhblNjaGVtYSwgc2NoZW1hICk7XG5cbiAgICBzY2hlbWFGaWVsZHMgPSBzY2hlbWEuZmllbGRzO1xuXG4gIH0gZWxzZSB7XG5cbiAgICBzY2hlbWFGaWVsZHMgPSBzY2hlbWE7XG5cbiAgfVxuXG4gIE9iamVjdC5rZXlzKCBzY2hlbWFGaWVsZHMgKS5mb3JFYWNoKCBicmFuY2hLZXkgPT4ge1xuXG4gICAgY2xlYW5TY2hlbWEuZmllbGRzWyBicmFuY2hLZXkgXSA9IGNsZWFuKCBzY2hlbWFGaWVsZHNbIGJyYW5jaEtleSBdICk7XG5cbiAgfSApO1xuXG4gIHJldHVybiBjbGVhblNjaGVtYTtcblxufVxuXG5cbmZ1bmN0aW9uIF9pc05vcm1hbGl6ZWQoIHNjaGVtYSApIHtcblxuICBpZiAoIHNjaGVtYS5maWVsZHMgKSByZXR1cm4gdHJ1ZTtcblxuICByZXR1cm4gZmFsc2U7XG5cbn1cblxuXG5mdW5jdGlvbiBfaXNMZWFmKCBub2RlICkge1xuXG4gIGxldCBpcyA9IGZhbHNlO1xuXG4gIGlmICggbm9kZSAmJiBub2RlLnR5cGUgJiYgdHlwZW9mIG5vZGUudHlwZSAhPT0gJ29iamVjdCcgJiYgbm9kZS50eXBlICE9PSAnc2NoZW1hJyApIHtcblxuICAgIGlzID0gdHJ1ZTtcblxuICB9IGVsc2Uge1xuXG4gICAgaXMgPSAhT2JqZWN0LmtleXMoIG5vZGUgfHwge30gKS5maWx0ZXIoIGsgPT4ge1xuXG4gICAgICByZXR1cm4gKCB0eXBlb2Ygbm9kZVsgayBdID09PSAnb2JqZWN0JyAmJiBub2RlWyBrIF0gIT09IG51bGwgKTtcblxuICAgIH0gKS5sZW5ndGg7XG5cbiAgfVxuXG4gIHJldHVybiBpcztcblxufSJdfQ==