"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _object = require('./object');

var _object2 = _interopRequireDefault(_object);

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validators = {};

factory.register = register;

module.exports = factory;

function factory(struct) {

  var validator = generator(struct);

  return function (values) {

    var listValues = _mapToList(values);

    var clean = validator(listValues);

    return _mapToObject(clean);
  };
}

function generator(struct, field) {

  var validatorStruct = Object.keys(struct).map(function (k) {

    var type = struct[k].type || 'object';

    if (type !== 'object' && typeof validators[type] === 'undefined') {

      throw 'unregistered validator type: ' + struct[k].type;
    }

    if (type === 'object') {

      return generator(struct[k], k);
    } else {

      return validators[type](_utils2.default.extend(struct[k], { field: k }));
    }
  });

  return (0, _object2.default)({ field: field }, validatorStruct);
}

function register(v) {

  Object.keys(v).forEach(function (k) {

    validators[k] = v[k];
  });
}

function _mapToList(values) {

  if (!values) return [];

  return Object.keys(values).map(function (k) {

    var isObject = values[k] && _typeof(values[k]) === 'object';

    return {
      field: k,
      value: isObject ? _mapToList(values[k]) : values[k]
    };
  });
}

function _mapToObject(values) {

  if (!values) return {};

  var obj = {};

  values.forEach(function (v) {

    if (_utils2.default.isArray(v.value)) {

      obj[v.field] = _mapToObject(v.value);
    } else {

      obj[v.field] = v.value;
    }
  });

  return obj;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nZW5lcmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFJLGFBQWEsRUFBakI7O0FBRUEsUUFBUSxRQUFSLEdBQW1CLFFBQW5COztBQUVBLE9BQU8sT0FBUCxHQUFpQixPQUFqQjs7QUFFQSxTQUFTLE9BQVQsQ0FBa0IsTUFBbEIsRUFBMkI7O0FBRXpCLE1BQUksWUFBWSxVQUFXLE1BQVgsQ0FBaEI7O0FBRUEsU0FBTyxVQUFVLE1BQVYsRUFBbUI7O0FBRXhCLFFBQUksYUFBYSxXQUFZLE1BQVosQ0FBakI7O0FBRUEsUUFBSSxRQUFRLFVBQVcsVUFBWCxDQUFaOztBQUVBLFdBQU8sYUFBYyxLQUFkLENBQVA7QUFFRCxHQVJEO0FBVUQ7O0FBRUQsU0FBUyxTQUFULENBQW9CLE1BQXBCLEVBQTRCLEtBQTVCLEVBQW9DOztBQUVsQyxNQUFJLGtCQUFrQixPQUFPLElBQVAsQ0FBYSxNQUFiLEVBQXNCLEdBQXRCLENBQTJCLGFBQUs7O0FBRXBELFFBQUksT0FBTyxPQUFRLENBQVIsRUFBWSxJQUFaLElBQW9CLFFBQS9COztBQUVBLFFBQUssU0FBUyxRQUFULElBQXFCLE9BQU8sV0FBWSxJQUFaLENBQVAsS0FBOEIsV0FBeEQsRUFBc0U7O0FBRXBFLFlBQU0sa0NBQWtDLE9BQVEsQ0FBUixFQUFZLElBQXBEO0FBRUQ7O0FBRUQsUUFBSyxTQUFTLFFBQWQsRUFBeUI7O0FBRXZCLGFBQU8sVUFBVyxPQUFRLENBQVIsQ0FBWCxFQUF3QixDQUF4QixDQUFQO0FBRUQsS0FKRCxNQUlPOztBQUVMLGFBQU8sV0FBWSxJQUFaLEVBQW9CLGdCQUFNLE1BQU4sQ0FBYyxPQUFRLENBQVIsQ0FBZCxFQUEyQixFQUFFLE9BQU8sQ0FBVCxFQUEzQixDQUFwQixDQUFQO0FBRUQ7QUFFRixHQXBCcUIsQ0FBdEI7O0FBc0JBLFNBQU8sc0JBQWlCLEVBQUUsT0FBTyxLQUFULEVBQWpCLEVBQW1DLGVBQW5DLENBQVA7QUFFRDs7QUFFRCxTQUFTLFFBQVQsQ0FBbUIsQ0FBbkIsRUFBdUI7O0FBRXJCLFNBQU8sSUFBUCxDQUFhLENBQWIsRUFBaUIsT0FBakIsQ0FBMEIsYUFBSzs7QUFFN0IsZUFBWSxDQUFaLElBQWtCLEVBQUcsQ0FBSCxDQUFsQjtBQUVELEdBSkQ7QUFNRDs7QUFHRCxTQUFTLFVBQVQsQ0FBcUIsTUFBckIsRUFBOEI7O0FBRTVCLE1BQUssQ0FBQyxNQUFOLEVBQWUsT0FBTyxFQUFQOztBQUVmLFNBQU8sT0FBTyxJQUFQLENBQWEsTUFBYixFQUFzQixHQUF0QixDQUEyQixhQUFLOztBQUVyQyxRQUFJLFdBQVcsT0FBUSxDQUFSLEtBQWUsUUFBTyxPQUFRLENBQVIsQ0FBUCxNQUF1QixRQUFyRDs7QUFFQSxXQUFPO0FBQ0wsYUFBTyxDQURGO0FBRUwsYUFBTyxXQUFXLFdBQVksT0FBUSxDQUFSLENBQVosQ0FBWCxHQUF1QyxPQUFRLENBQVI7QUFGekMsS0FBUDtBQUtELEdBVE0sQ0FBUDtBQVdEOztBQUdELFNBQVMsWUFBVCxDQUF1QixNQUF2QixFQUFnQzs7QUFFOUIsTUFBSyxDQUFDLE1BQU4sRUFBZSxPQUFPLEVBQVA7O0FBRWYsTUFBSSxNQUFNLEVBQVY7O0FBRUEsU0FBTyxPQUFQLENBQWdCLGFBQUs7O0FBRW5CLFFBQUssZ0JBQU0sT0FBTixDQUFlLEVBQUUsS0FBakIsQ0FBTCxFQUFnQzs7QUFFN0IsVUFBSyxFQUFFLEtBQVAsSUFBaUIsYUFBYyxFQUFFLEtBQWhCLENBQWpCO0FBRUYsS0FKRCxNQUlPOztBQUVMLFVBQUssRUFBRSxLQUFQLElBQWlCLEVBQUUsS0FBbkI7QUFFRDtBQUVGLEdBWkQ7O0FBY0EsU0FBTyxHQUFQO0FBRUQiLCJmaWxlIjoiZ2VuZXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCBvYmplY3RWYWxpZGF0b3IgZnJvbSAnLi9vYmplY3QnO1xuaW1wb3J0IHV0aWxzIGZyb20gJ3V0aWxzJztcblxubGV0IHZhbGlkYXRvcnMgPSB7fTtcblxuZmFjdG9yeS5yZWdpc3RlciA9IHJlZ2lzdGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7XG5cbmZ1bmN0aW9uIGZhY3RvcnkoIHN0cnVjdCApIHtcblxuICBsZXQgdmFsaWRhdG9yID0gZ2VuZXJhdG9yKCBzdHJ1Y3QgKTtcblxuICByZXR1cm4gZnVuY3Rpb24oIHZhbHVlcyApIHtcblxuICAgIGxldCBsaXN0VmFsdWVzID0gX21hcFRvTGlzdCggdmFsdWVzICk7XG5cbiAgICBsZXQgY2xlYW4gPSB2YWxpZGF0b3IoIGxpc3RWYWx1ZXMgKTtcblxuICAgIHJldHVybiBfbWFwVG9PYmplY3QoIGNsZWFuICk7XG5cbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRvciggc3RydWN0LCBmaWVsZCApIHtcblxuICBsZXQgdmFsaWRhdG9yU3RydWN0ID0gT2JqZWN0LmtleXMoIHN0cnVjdCApLm1hcCggayA9PiB7XG5cbiAgICBsZXQgdHlwZSA9IHN0cnVjdFsgayBdLnR5cGUgfHzCoCdvYmplY3QnO1xuXG4gICAgaWYgKCB0eXBlICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdmFsaWRhdG9yc1sgdHlwZSBdID09PSAndW5kZWZpbmVkJyApIHtcblxuICAgICAgdGhyb3cgJ3VucmVnaXN0ZXJlZCB2YWxpZGF0b3IgdHlwZTogJyArIHN0cnVjdFsgayBdLnR5cGU7XG5cbiAgICB9XG5cbiAgICBpZiAoIHR5cGUgPT09ICdvYmplY3QnICkge1xuXG4gICAgICByZXR1cm4gZ2VuZXJhdG9yKCBzdHJ1Y3RbwqBrIF0sIGsgKTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgIHJldHVybiB2YWxpZGF0b3JzWyB0eXBlIF0oIHV0aWxzLmV4dGVuZCggc3RydWN0WyBrIF0sIHvCoGZpZWxkOiBrIH0gKSApO1xuXG4gICAgfVxuXG4gIH0gKTtcblxuICByZXR1cm4gb2JqZWN0VmFsaWRhdG9yKCB7IGZpZWxkOiBmaWVsZCB9LCB2YWxpZGF0b3JTdHJ1Y3QgKTtcblxufVxuXG5mdW5jdGlvbiByZWdpc3RlciggdiApIHtcblxuICBPYmplY3Qua2V5cyggdiApLmZvckVhY2goIGsgPT4ge1xuXG4gICAgdmFsaWRhdG9yc1sgayBdID0gdlsgayBdO1xuXG4gIH0gKTtcblxufVxuXG5cbmZ1bmN0aW9uIF9tYXBUb0xpc3QoIHZhbHVlcyApIHtcblxuICBpZiAoICF2YWx1ZXMgKSByZXR1cm4gW107XG5cbiAgcmV0dXJuIE9iamVjdC5rZXlzKCB2YWx1ZXMgKS5tYXAoIGsgPT4ge1xuXG4gICAgbGV0IGlzT2JqZWN0ID0gdmFsdWVzWyBrIF0gJiYgdHlwZW9mIHZhbHVlc1sgayBdID09PSAnb2JqZWN0JztcblxuICAgIHJldHVybiB7XG4gICAgICBmaWVsZDogayxcbiAgICAgIHZhbHVlOiBpc09iamVjdCA/IF9tYXBUb0xpc3QoIHZhbHVlc1sgayBdICkgOiB2YWx1ZXNbIGsgXVxuICAgIH1cblxuICB9ICk7XG5cbn1cblxuXG5mdW5jdGlvbiBfbWFwVG9PYmplY3QoIHZhbHVlcyApIHtcblxuICBpZiAoICF2YWx1ZXMgKSByZXR1cm4ge307XG5cbiAgbGV0IG9iaiA9IHt9O1xuXG4gIHZhbHVlcy5mb3JFYWNoKCB2ID0+IHtcblxuICAgIGlmICggdXRpbHMuaXNBcnJheSggdi52YWx1ZSApICkge1xuXG4gICAgICAgb2JqWyB2LmZpZWxkIF0gPSBfbWFwVG9PYmplY3QoIHYudmFsdWUgKVxuXG4gICAgfSBlbHNlIHtcblxuICAgICAgb2JqWyB2LmZpZWxkIF0gPSB2LnZhbHVlO1xuXG4gICAgfVxuXG4gIH0gKTtcblxuICByZXR1cm4gb2JqO1xuXG59Il19