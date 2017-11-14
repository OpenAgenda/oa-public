"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var actions = _utils2.default.extend({}, _search2.default, _events2.default);

exports.default = actions;
module.exports = exports['default'];