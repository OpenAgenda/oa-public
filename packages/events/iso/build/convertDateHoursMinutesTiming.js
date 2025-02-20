'use strict';

const moment = require('moment-timezone');
const fZ = n => ("".concat(n).length === 1 ? '0' : '') + n;
module.exports.from = function (_ref) {
  let {
    date,
    hours,
    minutes
  } = _ref;
  let timezone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Europe/Paris';
  return moment.tz("".concat(date, "T").concat(fZ(hours), ":").concat(fZ(minutes)), timezone).locale('en').toISOString(true);
};
module.exports.to = function (date) {
  let timezone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Europe/Paris';
  const m = moment.tz(date, timezone).locale('en');
  return {
    date: m.format('YYYY-MM-DD'),
    hours: m.format('HH'),
    minutes: m.format('mm')
  };
};
//# sourceMappingURL=convertDateHoursMinutesTiming.js.map