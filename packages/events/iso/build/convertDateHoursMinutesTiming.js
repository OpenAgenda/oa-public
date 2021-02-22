'use strict';

var _concatInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/concat");

var moment = require('moment-timezone');

var fZ = function fZ(n) {
  return ("".concat(n).length === 1 ? '0' : '') + n;
};

module.exports.from = function (_ref) {
  var _context, _context2;

  var date = _ref.date,
      hours = _ref.hours,
      minutes = _ref.minutes;
  var timezone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Europe/Paris';
  return moment.tz(_concatInstanceProperty(_context = _concatInstanceProperty(_context2 = "".concat(date, "T")).call(_context2, fZ(hours), ":")).call(_context, fZ(minutes)), timezone).locale('en').toISOString(true);
};

module.exports.to = function (date) {
  var timezone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Europe/Paris';
  var m = moment.tz(date, timezone).locale('en');
  return {
    date: m.format('YYYY-MM-DD'),
    hours: m.format('HH'),
    minutes: m.format('mm')
  };
};
//# sourceMappingURL=convertDateHoursMinutesTiming.js.map