'use strict';

var _objectSpread = require("@babel/runtime-corejs3/helpers/objectSpread2").default;

var _concatInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/concat");

var _Array$isArray = require("@babel/runtime-corejs3/core-js/array/is-array");

var _forEachInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/for-each");

var _sortInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/sort");

var validateDateHoursMinutesTiming = require('./dateHoursMinutesTiming');

var isDateHoursMinutesTiming = validateDateHoursMinutesTiming.is;

var validateTiming = require('./timing');

var fZ = function fZ(n) {
  return ("".concat(n).length === 1 ? '0' : '') + n;
};

var DHMToString = function DHMToString(t) {
  var _context, _context2;

  return _concatInstanceProperty(_context = _concatInstanceProperty(_context2 = "".concat(t.date, "T")).call(_context2, fZ(t.hours), ":")).call(_context, fZ(t.minutes));
};

module.exports = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (dirty) {
    var errors = [];
    var baseError = {
      origin: dirty,
      field: 'timings'
    };
    var timings = options.default && dirty === undefined ? options.default : dirty;

    if (options.optional && !timings) {
      return timings;
    }

    if (!_Array$isArray(timings)) {
      throw [_objectSpread(_objectSpread({}, baseError), {}, {
        code: 'timings.invalid',
        message: 'Invalid timings'
      })];
    }

    if (!timings.length) {
      throw [_objectSpread(_objectSpread({}, baseError), {}, {
        code: 'timings.min.1',
        message: 'at least one timing is required'
      })];
    }

    var isDHM = isDateHoursMinutesTiming(timings[0]);
    var validateSingle = isDHM ? validateDateHoursMinutesTiming : validateTiming;
    var cleanTimings = [];

    _forEachInstanceProperty(timings).call(timings, function (timing, index) {
      try {
        cleanTimings.push(validateSingle(timing));
      } catch (timingErrors) {
        _forEachInstanceProperty(timingErrors).call(timingErrors, function (e) {
          return errors.push(_objectSpread(_objectSpread({}, e), {}, {
            index: index
          }));
        });
      }
    });

    if (errors.length) {
      throw errors;
    }

    if (isDHM) {
      return _sortInstanceProperty(cleanTimings).call(cleanTimings, function (t1, t2) {
        return DHMToString(t1.begin) < DHMToString(t2.begin) ? -1 : 1;
      });
    }

    return _sortInstanceProperty(cleanTimings).call(cleanTimings, function (t1, t2) {
      return t1.begin < t2.begin ? -1 : 1;
    });
  };
};
//# sourceMappingURL=timings.js.map