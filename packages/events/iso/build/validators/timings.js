'use strict';

var _includesInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/includes");
var _sortInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/sort");
const validateDateHoursMinutesTiming = require('./dateHoursMinutesTiming');
const {
  is: isDateHoursMinutesTiming
} = validateDateHoursMinutesTiming;
const validateTiming = require('./timing');
const fZ = n => ("".concat(n).length === 1 ? '0' : '') + n;
const DHMToString = t => "".concat(t.date, "T").concat(fZ(t.hours), ":").concat(fZ(t.minutes));
module.exports = function () {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return dirty => {
    var _context;
    const errors = [];
    const baseError = {
      origin: dirty,
      field: 'timings'
    };
    const timings = options.default && _includesInstanceProperty(_context = [undefined, null]).call(_context, dirty) ? options.default : dirty;
    if (options.optional && !timings) {
      return timings;
    }
    if (!Array.isArray(timings)) {
      // eslint-disable-next-line no-throw-literal
      throw [{
        ...baseError,
        code: 'timings.invalid',
        message: 'Invalid timings'
      }];
    }
    if (!timings.length) {
      // eslint-disable-next-line no-throw-literal
      throw [{
        ...baseError,
        code: 'timings.min.1',
        message: 'at least one timing is required'
      }];
    }
    if (options.max && timings.length > options.max) {
      // eslint-disable-next-line no-throw-literal
      throw [{
        ...baseError,
        code: "timings.max.".concat(options.max),
        message: "maximum authorized number of timings (".concat(options.max, ") exceeded: ").concat(timings.length)
      }];
    }
    const isDHM = isDateHoursMinutesTiming(timings[0]);
    const validateSingle = isDHM ? validateDateHoursMinutesTiming : validateTiming;
    const cleanTimings = [];
    timings.forEach((timing, index) => {
      try {
        cleanTimings.push(validateSingle(timing));
      } catch (timingErrors) {
        timingErrors.forEach(e => errors.push({
          ...baseError,
          ...e,
          index
        }));
      }
    });
    if (errors.length) {
      throw errors;
    }
    if (isDHM) {
      return _sortInstanceProperty(cleanTimings).call(cleanTimings, (t1, t2) => DHMToString(t1.begin) < DHMToString(t2.begin) ? -1 : 1);
    }
    return _sortInstanceProperty(cleanTimings).call(cleanTimings, (t1, t2) => t1.begin < t2.begin ? -1 : 1);
  };
};
//# sourceMappingURL=timings.js.map