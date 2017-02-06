"use strict";

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

var _listify = require('../listify');

var _listify2 = _interopRequireDefault(_listify);

var _root = require('./root');

var _root2 = _interopRequireDefault(_root);

var _clean = require('./clean');

var _clean2 = _interopRequireDefault(_clean);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  fields: {}
};

var registeredValidators = { schema: schema };

module.exports = _utils2.default.extend(schema, { register: register });

function schema(options) {

  if (!options) {

    throw new Error('schema params missing at creation');
  }

  var params = _utils2.default.extend({ field: null, list: false }, defaults, options.fields ? options : { fields: options, root: true });

  if (params.root) {

    _utils2.default.extend(params, (0, _clean2.default)(params.fields));
  }

  if (params.field) {

    _utils2.default.extend(validate, { field: params.field });
  }

  /**
   * exposed endpoints
   */
  return _utils2.default.extend(params.list ? (0, _listify2.default)(validate, params) : validate, {
    part: part,
    default: _root2.default.getDefault(params.fields),
    fields: params.fields,
    struct: params.root ? options : params.fields // legacy
  });

  function validate(value) {

    var flattened = _root2.default.getFlat(params.fields, value);

    var errors = [],
        clean = {};

    flattened.forEach(function (flat) {

      try {

        clean[flat.field] = flat.validator(flat.value);
      } catch (errs) {

        errors = errors.concat(errs.map(function (e) {

          return params.field ? _utils2.default.extend({}, e, { field: params.field + '.' + e.field }) : e;
        }));
      }
    });

    if (errors.length) {

      throw errors;
    }

    return clean;
  }

  function part(path, value) {

    if (_utils2.default.isArray(path)) {

      return parts(path, value);
    }

    var cursor = params.fields,
        branches = path.split('.'),
        leaf = branches.pop();

    // dig down
    branches.forEach(function (b) {

      cursor = cursor[b].fields;
    });

    cursor = cursor[leaf];

    var validator = registeredValidators[cursor.type](cursor);

    return validator(value);
  }

  function parts(paths, value) {

    var clean = {},
        errors = [];

    paths.forEach(function (p) {

      try {

        _utils2.default.deep.set(clean, p, part(p, _utils2.default.deep(value, p)));
      } catch (errs) {

        errors = errors.concat(errs);
      }
    });

    if (errors.length) throw errors;

    return clean;
  }
}

function register(v) {

  Object.keys(v).forEach(function (k) {

    registeredValidators[k] = v[k];
  });

  _root2.default.registerValidators(registeredValidators);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zY2hlbWEvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU0sV0FBVztBQUNmLFVBQVE7QUFETyxDQUFqQjs7QUFJQSxJQUFJLHVCQUF1QixFQUFFLGNBQUYsRUFBM0I7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLGdCQUFNLE1BQU4sQ0FBYyxNQUFkLEVBQXNCLEVBQUUsa0JBQUYsRUFBdEIsQ0FBakI7O0FBRUEsU0FBUyxNQUFULENBQWlCLE9BQWpCLEVBQTJCOztBQUV6QixNQUFLLENBQUMsT0FBTixFQUFnQjs7QUFFZCxVQUFNLElBQUksS0FBSixDQUFXLG1DQUFYLENBQU47QUFFRDs7QUFFRCxNQUFNLFNBQVMsZ0JBQU0sTUFBTixDQUNiLEVBQUUsT0FBTyxJQUFULEVBQWUsTUFBTSxLQUFyQixFQURhLEVBRWIsUUFGYSxFQUdiLFFBQVEsTUFBUixHQUFpQixPQUFqQixHQUEyQixFQUFFLFFBQVEsT0FBVixFQUFtQixNQUFNLElBQXpCLEVBSGQsQ0FBZjs7QUFNQSxNQUFLLE9BQU8sSUFBWixFQUFtQjs7QUFFakIsb0JBQU0sTUFBTixDQUFjLE1BQWQsRUFBc0IscUJBQWEsT0FBTyxNQUFwQixDQUF0QjtBQUVEOztBQUVELE1BQUssT0FBTyxLQUFaLEVBQW9COztBQUVsQixvQkFBTSxNQUFOLENBQWMsUUFBZCxFQUF3QixFQUFFLE9BQU8sT0FBTyxLQUFoQixFQUF4QjtBQUVEOztBQUVEOzs7QUFHQSxTQUFPLGdCQUFNLE1BQU4sQ0FBYyxPQUFPLElBQVAsR0FBYyx1QkFBUyxRQUFULEVBQW1CLE1BQW5CLENBQWQsR0FBNEMsUUFBMUQsRUFBb0U7QUFDekUsY0FEeUU7QUFFekUsYUFBUyxlQUFFLFVBQUYsQ0FBYyxPQUFPLE1BQXJCLENBRmdFO0FBR3pFLFlBQVEsT0FBTyxNQUgwRDtBQUl6RSxZQUFRLE9BQU8sSUFBUCxHQUFjLE9BQWQsR0FBd0IsT0FBTyxNQUprQyxDQUkzQjtBQUoyQixHQUFwRSxDQUFQOztBQU9BLFdBQVMsUUFBVCxDQUFtQixLQUFuQixFQUEyQjs7QUFFekIsUUFBTSxZQUFZLGVBQUUsT0FBRixDQUFXLE9BQU8sTUFBbEIsRUFBMEIsS0FBMUIsQ0FBbEI7O0FBRUEsUUFBSSxTQUFTLEVBQWI7QUFBQSxRQUFpQixRQUFRLEVBQXpCOztBQUVBLGNBQVUsT0FBVixDQUFtQixnQkFBUTs7QUFFekIsVUFBSTs7QUFFRixjQUFPLEtBQUssS0FBWixJQUFzQixLQUFLLFNBQUwsQ0FBZ0IsS0FBSyxLQUFyQixDQUF0QjtBQUVELE9BSkQsQ0FJRSxPQUFRLElBQVIsRUFBZTs7QUFFZixpQkFBUyxPQUFPLE1BQVAsQ0FBZSxLQUFLLEdBQUwsQ0FBVSxhQUFLOztBQUVyQyxpQkFBTyxPQUFPLEtBQVAsR0FBZSxnQkFBTSxNQUFOLENBQWMsRUFBZCxFQUFrQixDQUFsQixFQUFxQixFQUFFLE9BQU8sT0FBTyxLQUFQLEdBQWUsR0FBZixHQUFxQixFQUFFLEtBQWhDLEVBQXJCLENBQWYsR0FBZ0YsQ0FBdkY7QUFFRCxTQUp1QixDQUFmLENBQVQ7QUFNRDtBQUVGLEtBaEJEOztBQWtCQSxRQUFLLE9BQU8sTUFBWixFQUFxQjs7QUFFbkIsWUFBTSxNQUFOO0FBRUQ7O0FBRUQsV0FBTyxLQUFQO0FBRUQ7O0FBR0QsV0FBUyxJQUFULENBQWUsSUFBZixFQUFxQixLQUFyQixFQUE2Qjs7QUFFM0IsUUFBSyxnQkFBTSxPQUFOLENBQWUsSUFBZixDQUFMLEVBQTZCOztBQUUzQixhQUFPLE1BQU8sSUFBUCxFQUFhLEtBQWIsQ0FBUDtBQUVEOztBQUVELFFBQUksU0FBUyxPQUFPLE1BQXBCO0FBQUEsUUFFQSxXQUFXLEtBQUssS0FBTCxDQUFZLEdBQVosQ0FGWDtBQUFBLFFBSUEsT0FBTyxTQUFTLEdBQVQsRUFKUDs7QUFNQTtBQUNBLGFBQVMsT0FBVCxDQUFrQixhQUFLOztBQUVyQixlQUFTLE9BQVEsQ0FBUixFQUFZLE1BQXJCO0FBRUQsS0FKRDs7QUFNQSxhQUFTLE9BQVEsSUFBUixDQUFUOztBQUVBLFFBQUksWUFBWSxxQkFBc0IsT0FBTyxJQUE3QixFQUFxQyxNQUFyQyxDQUFoQjs7QUFFQSxXQUFPLFVBQVcsS0FBWCxDQUFQO0FBRUQ7O0FBR0QsV0FBUyxLQUFULENBQWdCLEtBQWhCLEVBQXVCLEtBQXZCLEVBQStCOztBQUU3QixRQUFJLFFBQVEsRUFBWjtBQUFBLFFBQWdCLFNBQVMsRUFBekI7O0FBRUEsVUFBTSxPQUFOLENBQWUsYUFBSzs7QUFFbEIsVUFBSTs7QUFFRix3QkFBTSxJQUFOLENBQVcsR0FBWCxDQUFnQixLQUFoQixFQUF1QixDQUF2QixFQUEwQixLQUFNLENBQU4sRUFBUyxnQkFBTSxJQUFOLENBQVksS0FBWixFQUFtQixDQUFuQixDQUFULENBQTFCO0FBRUQsT0FKRCxDQUlFLE9BQU8sSUFBUCxFQUFjOztBQUVkLGlCQUFTLE9BQU8sTUFBUCxDQUFlLElBQWYsQ0FBVDtBQUVEO0FBRUYsS0FaRDs7QUFjQSxRQUFLLE9BQU8sTUFBWixFQUFxQixNQUFNLE1BQU47O0FBRXJCLFdBQU8sS0FBUDtBQUVEO0FBRUY7O0FBR0QsU0FBUyxRQUFULENBQW1CLENBQW5CLEVBQXVCOztBQUVyQixTQUFPLElBQVAsQ0FBYSxDQUFiLEVBQWlCLE9BQWpCLENBQTBCLGFBQUs7O0FBRTdCLHlCQUFzQixDQUF0QixJQUE0QixFQUFHLENBQUgsQ0FBNUI7QUFFRCxHQUpEOztBQU1BLGlCQUFFLGtCQUFGLENBQXNCLG9CQUF0QjtBQUVEIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCB1dGlscyBmcm9tICd1dGlscyc7XG5pbXBvcnQgbGlzdGlmeSBmcm9tICcuLi9saXN0aWZ5JztcbmltcG9ydCByIGZyb20gJy4vcm9vdCc7XG5pbXBvcnQgY2xlYW5TY2hlbWEgZnJvbSAnLi9jbGVhbic7XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBmaWVsZHM6IHt9XG59XG5cbmxldCByZWdpc3RlcmVkVmFsaWRhdG9ycyA9IHsgc2NoZW1hIH07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbHMuZXh0ZW5kKCBzY2hlbWEsIHsgcmVnaXN0ZXIgfSApO1xuXG5mdW5jdGlvbiBzY2hlbWEoIG9wdGlvbnMgKSB7XG5cbiAgaWYgKCAhb3B0aW9ucyApIHtcblxuICAgIHRocm93IG5ldyBFcnJvciggJ3NjaGVtYSBwYXJhbXMgbWlzc2luZyBhdCBjcmVhdGlvbicgKTtcblxuICB9XG5cbiAgY29uc3QgcGFyYW1zID0gdXRpbHMuZXh0ZW5kKCBcbiAgICB7IGZpZWxkOiBudWxsLCBsaXN0OiBmYWxzZSB9LCBcbiAgICBkZWZhdWx0cywgXG4gICAgb3B0aW9ucy5maWVsZHMgPyBvcHRpb25zIDogeyBmaWVsZHM6IG9wdGlvbnMsIHJvb3Q6IHRydWUgfVxuICApO1xuXG4gIGlmICggcGFyYW1zLnJvb3QgKSB7XG5cbiAgICB1dGlscy5leHRlbmQoIHBhcmFtcywgY2xlYW5TY2hlbWEoIHBhcmFtcy5maWVsZHMgKSApO1xuXG4gIH1cblxuICBpZiAoIHBhcmFtcy5maWVsZCApIHtcblxuICAgIHV0aWxzLmV4dGVuZCggdmFsaWRhdGUsIHsgZmllbGQ6IHBhcmFtcy5maWVsZCB9ICk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBleHBvc2VkIGVuZHBvaW50c1xuICAgKi9cbiAgcmV0dXJuIHV0aWxzLmV4dGVuZCggcGFyYW1zLmxpc3QgPyBsaXN0aWZ5KCB2YWxpZGF0ZSwgcGFyYW1zICkgOiB2YWxpZGF0ZSwgeyBcbiAgICBwYXJ0LFxuICAgIGRlZmF1bHQ6IHIuZ2V0RGVmYXVsdCggcGFyYW1zLmZpZWxkcyApLFxuICAgIGZpZWxkczogcGFyYW1zLmZpZWxkcyxcbiAgICBzdHJ1Y3Q6IHBhcmFtcy5yb290ID8gb3B0aW9ucyA6IHBhcmFtcy5maWVsZHMgLy8gbGVnYWN5XG4gIH0gKTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZSggdmFsdWUgKSB7XG5cbiAgICBjb25zdCBmbGF0dGVuZWQgPSByLmdldEZsYXQoIHBhcmFtcy5maWVsZHMsIHZhbHVlICk7XG5cbiAgICBsZXQgZXJyb3JzID0gW10sIGNsZWFuID0ge307XG5cbiAgICBmbGF0dGVuZWQuZm9yRWFjaCggZmxhdCA9PiB7XG5cbiAgICAgIHRyeSB7XG5cbiAgICAgICAgY2xlYW5bIGZsYXQuZmllbGQgXSA9IGZsYXQudmFsaWRhdG9yKCBmbGF0LnZhbHVlICk7XG5cbiAgICAgIH0gY2F0Y2ggKCBlcnJzICkge1xuXG4gICAgICAgIGVycm9ycyA9IGVycm9ycy5jb25jYXQoIGVycnMubWFwKCBlID0+IHtcblxuICAgICAgICAgIHJldHVybiBwYXJhbXMuZmllbGQgPyB1dGlscy5leHRlbmQoIHt9LCBlLCB7IGZpZWxkOiBwYXJhbXMuZmllbGQgKyAnLicgKyBlLmZpZWxkIH0gKSA6IGU7XG5cbiAgICAgICAgfSApICk7XG5cbiAgICAgIH1cblxuICAgIH0gKTtcblxuICAgIGlmICggZXJyb3JzLmxlbmd0aCApIHtcblxuICAgICAgdGhyb3cgZXJyb3JzO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFuO1xuXG4gIH1cblxuXG4gIGZ1bmN0aW9uIHBhcnQoIHBhdGgsIHZhbHVlICkge1xuXG4gICAgaWYgKCB1dGlscy5pc0FycmF5KCBwYXRoICkgKSB7XG5cbiAgICAgIHJldHVybiBwYXJ0cyggcGF0aCwgdmFsdWUgKTtcblxuICAgIH1cblxuICAgIGxldCBjdXJzb3IgPSBwYXJhbXMuZmllbGRzLFxuXG4gICAgYnJhbmNoZXMgPSBwYXRoLnNwbGl0KCAnLicgKSxcblxuICAgIGxlYWYgPSBicmFuY2hlcy5wb3AoKTtcblxuICAgIC8vIGRpZyBkb3duXG4gICAgYnJhbmNoZXMuZm9yRWFjaCggYiA9PiB7XG5cbiAgICAgIGN1cnNvciA9IGN1cnNvclsgYiBdLmZpZWxkcztcblxuICAgIH0gKTtcblxuICAgIGN1cnNvciA9IGN1cnNvclsgbGVhZiBdO1xuXG4gICAgbGV0IHZhbGlkYXRvciA9IHJlZ2lzdGVyZWRWYWxpZGF0b3JzWyBjdXJzb3IudHlwZSBdKCBjdXJzb3IgKTtcblxuICAgIHJldHVybiB2YWxpZGF0b3IoIHZhbHVlICk7XG5cbiAgfVxuXG5cbiAgZnVuY3Rpb24gcGFydHMoIHBhdGhzLCB2YWx1ZSApIHtcblxuICAgIGxldCBjbGVhbiA9IHt9LCBlcnJvcnMgPSBbXTtcblxuICAgIHBhdGhzLmZvckVhY2goIHAgPT4ge1xuXG4gICAgICB0cnkge1xuXG4gICAgICAgIHV0aWxzLmRlZXAuc2V0KCBjbGVhbiwgcCwgcGFydCggcCwgdXRpbHMuZGVlcCggdmFsdWUsIHAgKSApICk7XG5cbiAgICAgIH0gY2F0Y2goIGVycnMgKSB7XG5cbiAgICAgICAgZXJyb3JzID0gZXJyb3JzLmNvbmNhdCggZXJycyApO1xuXG4gICAgICB9XG5cbiAgICB9ICk7XG5cbiAgICBpZiAoIGVycm9ycy5sZW5ndGggKSB0aHJvdyBlcnJvcnM7XG5cbiAgICByZXR1cm4gY2xlYW47XG5cbiAgfVxuXG59XG5cblxuZnVuY3Rpb24gcmVnaXN0ZXIoIHYgKSB7XG5cbiAgT2JqZWN0LmtleXMoIHYgKS5mb3JFYWNoKCBrID0+IHtcblxuICAgIHJlZ2lzdGVyZWRWYWxpZGF0b3JzWyBrIF0gPSB2WyBrIF07XG5cbiAgfSApO1xuXG4gIHIucmVnaXN0ZXJWYWxpZGF0b3JzKCByZWdpc3RlcmVkVmFsaWRhdG9ycyApO1xuXG59Il19