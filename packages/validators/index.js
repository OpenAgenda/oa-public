"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _text = _interopRequireDefault(require("./text"));
var _link = _interopRequireDefault(require("./link"));
var _ip = _interopRequireDefault(require("./ip"));
var _email = _interopRequireDefault(require("./email"));
var _phone = _interopRequireDefault(require("./phone"));
var _list = _interopRequireDefault(require("./list"));
var _number = _interopRequireDefault(require("./number"));
var _integer = _interopRequireDefault(require("./integer"));
var _date = _interopRequireDefault(require("./date"));
var _boolean = _interopRequireDefault(require("./boolean"));
var _labels = _interopRequireDefault(require("./labels"));
var _set = _interopRequireDefault(require("./set"));
var _stream = _interopRequireDefault(require("./stream"));
var _object = _interopRequireDefault(require("./object"));
var _latitude = _interopRequireDefault(require("./latitude"));
var _longitude = _interopRequireDefault(require("./longitude"));
var _pass = _interopRequireDefault(require("./pass"));
var _multilingual = _interopRequireDefault(require("./multilingual"));
var _regex = _interopRequireDefault(require("./regex"));
var _choice = _interopRequireDefault(require("./choice"));
var _timezone = _interopRequireDefault(require("./timezone"));
var _default = exports.default = {
  text: _text.default,
  link: _link.default,
  ip: _ip.default,
  email: _email.default,
  phone: _phone.default,
  list: _list.default,
  number: _number.default,
  integer: _integer.default,
  date: _date.default,
  boolean: _boolean.default,
  labels: _labels.default,
  set: _set.default,
  stream: _stream.default,
  object: _object.default,
  latitude: _latitude.default,
  longitude: _longitude.default,
  pass: _pass.default,
  multilingual: _multilingual.default,
  regex: _regex.default,
  choice: _choice.default,
  timezone: _timezone.default
};
module.exports = {
  text: require('./text'),
  link: require('./link'),
  ip: require('./ip'),
  email: require('./email'),
  phone: require('./phone'),
  list: require('./list'),
  number: require('./number'),
  integer: require('./integer'),
  date: require('./date'),
  boolean: require('./boolean'),
  labels: require('./labels'),
  set: require('./set'),
  stream: require('./stream'),
  object: require('./object'),
  latitude: require('./latitude'),
  longitude: require('./longitude'),
  pass: require('./pass'),
  multilingual: require('./multilingual'),
  regex: require('./regex'),
  choice: require('./choice'),
  timezone: require('./timezone')
};
//# sourceMappingURL=index.js.map