"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('lodash/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {

  var params = _core2.default.extend({
    field: false,
    options: [], // required. Put something
    key: 'value', // optional. For when labeled objects are given
    optional: true,
    min: null,
    max: null,
    default: null,
    unique: false
  }, config);

  return _core2.default.extend(function (value) {

    var clean = [].concat(value).map(function (v) {
      return _core2.default.isObject(v) ? v[params.key] : v;
    }).filter(function (v) {
      return params.options.indexOf(v) !== -1;
    });

    if (!clean.length && params.default !== null) {

      clean = [].concat(params.default);
    }

    if (!params.optional && !clean.length) {

      throw [_getError(params, value, {
        code: 'choice.required',
        message: 'a (known) value must be chosen'
      })];
    }

    if (params.unique) {

      return clean.length >= 1 ? clean[0] : clean;
    }

    if (params.min && clean.length < params.min) {

      throw [_getMinMaxError(params, value, 'choice.required.min')];
    }

    if (params.max && clean.length > params.max) {

      throw [_getMinMaxError(params, value, 'choice.required.max')];
    }

    return clean;
  }, {
    type: 'choice',
    field: params.field
  });
};

function _getError(params, origin, error) {

  return _core2.default.extend({
    origin: origin
  }, params.field ? { field: params.field } : {}, error);
}

function _getMinMaxError(params, origin, code) {

  var values = {},
      message = void 0;

  if (params.min !== null && params.max) {

    return _getError(params, origin, {
      message: 'between %min% and %max% choices must be made',
      values: { min: params.min, max: params.max },
      code: code
    });
  } else if (!params.max) {

    return _getError(params, origin, {
      message: 'at least %min% choices must be made',
      values: { min: params.min },
      code: code
    });
  } else {

    return _getError(params, origin, {
      message: 'a maximum of %max% choices is allowed',
      values: { max: params.max },
      code: code
    });
  }
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaG9pY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQUVBOzs7Ozs7a0JBRWUsa0JBQVU7O0FBRXZCLE1BQU0sU0FBUyxlQUFFLE1BQUYsQ0FBVTtBQUN2QixXQUFPLEtBRGdCO0FBRXZCLGFBQVMsRUFGYyxFQUVWO0FBQ2IsU0FBSyxPQUhrQixFQUdUO0FBQ2QsY0FBVSxJQUphO0FBS3ZCLFNBQUssSUFMa0I7QUFNdkIsU0FBSyxJQU5rQjtBQU92QixhQUFTLElBUGM7QUFRdkIsWUFBUTtBQVJlLEdBQVYsRUFTWixNQVRZLENBQWY7O0FBV0EsU0FBTyxlQUFFLE1BQUYsQ0FBVSxpQkFBUzs7QUFFeEIsUUFBSSxRQUFVLEdBRVgsTUFGVyxDQUVILEtBRkcsQ0FBRixDQUlULEdBSlMsQ0FJSjtBQUFBLGFBQUssZUFBRSxRQUFGLENBQVksQ0FBWixJQUFrQixFQUFHLE9BQU8sR0FBVixDQUFsQixHQUFvQyxDQUF6QztBQUFBLEtBSkksRUFNVCxNQU5TLENBTUQ7QUFBQSxhQUFLLE9BQU8sT0FBUCxDQUFlLE9BQWYsQ0FBd0IsQ0FBeEIsTUFBZ0MsQ0FBQyxDQUF0QztBQUFBLEtBTkMsQ0FBWjs7QUFRQSxRQUFLLENBQUMsTUFBTSxNQUFQLElBQWlCLE9BQU8sT0FBUCxLQUFtQixJQUF6QyxFQUFnRDs7QUFFOUMsY0FBUSxHQUFHLE1BQUgsQ0FBVyxPQUFPLE9BQWxCLENBQVI7QUFFRDs7QUFFRCxRQUFLLENBQUMsT0FBTyxRQUFSLElBQW9CLENBQUMsTUFBTSxNQUFoQyxFQUF5Qzs7QUFFdkMsWUFBTSxDQUFFLFVBQVcsTUFBWCxFQUFtQixLQUFuQixFQUEwQjtBQUNoQyxjQUFNLGlCQUQwQjtBQUVoQyxpQkFBUztBQUZ1QixPQUExQixDQUFGLENBQU47QUFLRDs7QUFFRCxRQUFLLE9BQU8sTUFBWixFQUFxQjs7QUFFbkIsYUFBTyxNQUFNLE1BQU4sSUFBZ0IsQ0FBaEIsR0FBb0IsTUFBTyxDQUFQLENBQXBCLEdBQWlDLEtBQXhDO0FBRUQ7O0FBRUQsUUFBSyxPQUFPLEdBQVAsSUFBYyxNQUFNLE1BQU4sR0FBZSxPQUFPLEdBQXpDLEVBQStDOztBQUU3QyxZQUFNLENBQUUsZ0JBQWlCLE1BQWpCLEVBQXlCLEtBQXpCLEVBQWdDLHFCQUFoQyxDQUFGLENBQU47QUFFRDs7QUFFRCxRQUFLLE9BQU8sR0FBUCxJQUFjLE1BQU0sTUFBTixHQUFlLE9BQU8sR0FBekMsRUFBK0M7O0FBRTdDLFlBQU0sQ0FBRSxnQkFBaUIsTUFBakIsRUFBeUIsS0FBekIsRUFBZ0MscUJBQWhDLENBQUYsQ0FBTjtBQUVEOztBQUVELFdBQU8sS0FBUDtBQUVELEdBN0NNLEVBNkNKO0FBQ0QsVUFBTSxRQURMO0FBRUQsV0FBTyxPQUFPO0FBRmIsR0E3Q0ksQ0FBUDtBQWtERCxDOztBQUVELFNBQVMsU0FBVCxDQUFvQixNQUFwQixFQUE0QixNQUE1QixFQUFvQyxLQUFwQyxFQUE0Qzs7QUFFMUMsU0FBTyxlQUFFLE1BQUYsQ0FBVTtBQUNmO0FBRGUsR0FBVixFQUVKLE9BQU8sS0FBUCxHQUFlLEVBQUUsT0FBTyxPQUFPLEtBQWhCLEVBQWYsR0FBeUMsRUFGckMsRUFFeUMsS0FGekMsQ0FBUDtBQUlEOztBQUVELFNBQVMsZUFBVCxDQUEwQixNQUExQixFQUFrQyxNQUFsQyxFQUEwQyxJQUExQyxFQUFpRDs7QUFFL0MsTUFBSSxTQUFTLEVBQWI7QUFBQSxNQUFpQixnQkFBakI7O0FBRUEsTUFBSyxPQUFPLEdBQVAsS0FBZSxJQUFmLElBQXVCLE9BQU8sR0FBbkMsRUFBeUM7O0FBRXZDLFdBQU8sVUFBVyxNQUFYLEVBQW1CLE1BQW5CLEVBQTJCO0FBQ2hDLGVBQVMsOENBRHVCO0FBRWhDLGNBQVEsRUFBRSxLQUFLLE9BQU8sR0FBZCxFQUFtQixLQUFLLE9BQU8sR0FBL0IsRUFGd0I7QUFHaEM7QUFIZ0MsS0FBM0IsQ0FBUDtBQU1ELEdBUkQsTUFRTyxJQUFLLENBQUMsT0FBTyxHQUFiLEVBQW1COztBQUV4QixXQUFPLFVBQVcsTUFBWCxFQUFtQixNQUFuQixFQUEyQjtBQUNoQyxlQUFTLHFDQUR1QjtBQUVoQyxjQUFRLEVBQUUsS0FBSyxPQUFPLEdBQWQsRUFGd0I7QUFHaEM7QUFIZ0MsS0FBM0IsQ0FBUDtBQU1ELEdBUk0sTUFRQTs7QUFFTCxXQUFPLFVBQVcsTUFBWCxFQUFtQixNQUFuQixFQUEyQjtBQUNoQyxlQUFTLHVDQUR1QjtBQUVoQyxjQUFRLEVBQUUsS0FBSyxPQUFPLEdBQWQsRUFGd0I7QUFHaEM7QUFIZ0MsS0FBM0IsQ0FBUDtBQU1EO0FBRUYiLCJmaWxlIjoiY2hvaWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBfIGZyb20gJ2xvZGFzaC9jb3JlJztcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnID0+IHtcblxuICBjb25zdCBwYXJhbXMgPSBfLmV4dGVuZCgge1xuICAgIGZpZWxkOiBmYWxzZSxcbiAgICBvcHRpb25zOiBbXSwgLy8gcmVxdWlyZWQuIFB1dCBzb21ldGhpbmdcbiAgICBrZXk6ICd2YWx1ZScsIC8vIG9wdGlvbmFsLiBGb3Igd2hlbiBsYWJlbGVkIG9iamVjdHMgYXJlIGdpdmVuXG4gICAgb3B0aW9uYWw6IHRydWUsXG4gICAgbWluOiBudWxsLFxuICAgIG1heDogbnVsbCxcbiAgICBkZWZhdWx0OiBudWxsLFxuICAgIHVuaXF1ZTogZmFsc2VcbiAgfSwgY29uZmlnICk7XG5cbiAgcmV0dXJuIF8uZXh0ZW5kKCB2YWx1ZSA9PiB7XG5cbiAgICBsZXQgY2xlYW4gPSAoIFtdXG5cbiAgICAgIC5jb25jYXQoIHZhbHVlICkgKVxuXG4gICAgICAubWFwKCB2ID0+IF8uaXNPYmplY3QoIHYgKSA/IHZbIHBhcmFtcy5rZXkgXSA6IHYgKVxuXG4gICAgICAuZmlsdGVyKCB2ID0+IHBhcmFtcy5vcHRpb25zLmluZGV4T2YoIHYgKSAhPT0gLTEgKTtcblxuICAgIGlmICggIWNsZWFuLmxlbmd0aCAmJiBwYXJhbXMuZGVmYXVsdCAhPT0gbnVsbCApIHtcblxuICAgICAgY2xlYW4gPSBbXS5jb25jYXQoIHBhcmFtcy5kZWZhdWx0ICk7XG5cbiAgICB9XG5cbiAgICBpZiAoICFwYXJhbXMub3B0aW9uYWwgJiYgIWNsZWFuLmxlbmd0aCApIHtcblxuICAgICAgdGhyb3cgWyBfZ2V0RXJyb3IoIHBhcmFtcywgdmFsdWUsIHtcbiAgICAgICAgY29kZTogJ2Nob2ljZS5yZXF1aXJlZCcsXG4gICAgICAgIG1lc3NhZ2U6ICdhIChrbm93bikgdmFsdWUgbXVzdCBiZSBjaG9zZW4nXG4gICAgICB9ICkgXTtcblxuICAgIH1cblxuICAgIGlmICggcGFyYW1zLnVuaXF1ZSApIHtcblxuICAgICAgcmV0dXJuIGNsZWFuLmxlbmd0aCA+PSAxID8gY2xlYW5bIDAgXSA6IGNsZWFuO1xuXG4gICAgfVxuXG4gICAgaWYgKCBwYXJhbXMubWluICYmIGNsZWFuLmxlbmd0aCA8IHBhcmFtcy5taW4gKSB7XG5cbiAgICAgIHRocm93IFsgX2dldE1pbk1heEVycm9yKCBwYXJhbXMsIHZhbHVlLCAnY2hvaWNlLnJlcXVpcmVkLm1pbicgKSBdO1xuXG4gICAgfVxuXG4gICAgaWYgKCBwYXJhbXMubWF4ICYmIGNsZWFuLmxlbmd0aCA+IHBhcmFtcy5tYXggKSB7XG5cbiAgICAgIHRocm93IFsgX2dldE1pbk1heEVycm9yKCBwYXJhbXMsIHZhbHVlLCAnY2hvaWNlLnJlcXVpcmVkLm1heCcgKSBdO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFuO1xuXG4gIH0sIHsgXG4gICAgdHlwZTogJ2Nob2ljZScsXG4gICAgZmllbGQ6IHBhcmFtcy5maWVsZCBcbiAgfSApO1xuXG59XG5cbmZ1bmN0aW9uIF9nZXRFcnJvciggcGFyYW1zLCBvcmlnaW4sIGVycm9yICkge1xuXG4gIHJldHVybiBfLmV4dGVuZCgge1xuICAgIG9yaWdpblxuICB9LCBwYXJhbXMuZmllbGQgPyB7IGZpZWxkOiBwYXJhbXMuZmllbGQgfSA6IHt9LCBlcnJvciApO1xuXG59IFxuXG5mdW5jdGlvbiBfZ2V0TWluTWF4RXJyb3IoIHBhcmFtcywgb3JpZ2luLCBjb2RlICkge1xuXG4gIGxldCB2YWx1ZXMgPSB7fSwgbWVzc2FnZTtcblxuICBpZiAoIHBhcmFtcy5taW4gIT09IG51bGwgJiYgcGFyYW1zLm1heCApIHtcblxuICAgIHJldHVybiBfZ2V0RXJyb3IoIHBhcmFtcywgb3JpZ2luLCB7XG4gICAgICBtZXNzYWdlOiAnYmV0d2VlbiAlbWluJSBhbmQgJW1heCUgY2hvaWNlcyBtdXN0IGJlIG1hZGUnLFxuICAgICAgdmFsdWVzOiB7IG1pbjogcGFyYW1zLm1pbiwgbWF4OiBwYXJhbXMubWF4IH0sXG4gICAgICBjb2RlXG4gICAgfSApXG5cbiAgfSBlbHNlIGlmICggIXBhcmFtcy5tYXggKSB7XG5cbiAgICByZXR1cm4gX2dldEVycm9yKCBwYXJhbXMsIG9yaWdpbiwge1xuICAgICAgbWVzc2FnZTogJ2F0IGxlYXN0ICVtaW4lIGNob2ljZXMgbXVzdCBiZSBtYWRlJyxcbiAgICAgIHZhbHVlczogeyBtaW46IHBhcmFtcy5taW4gfSxcbiAgICAgIGNvZGVcbiAgICB9ICk7XG5cbiAgfSBlbHNlIHtcblxuICAgIHJldHVybiBfZ2V0RXJyb3IoIHBhcmFtcywgb3JpZ2luLCB7XG4gICAgICBtZXNzYWdlOiAnYSBtYXhpbXVtIG9mICVtYXglIGNob2ljZXMgaXMgYWxsb3dlZCcsXG4gICAgICB2YWx1ZXM6IHsgbWF4OiBwYXJhbXMubWF4IH0sXG4gICAgICBjb2RlXG4gICAgfSApO1xuXG4gIH1cblxufSJdfQ==