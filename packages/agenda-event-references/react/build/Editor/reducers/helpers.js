"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js/object/define-property");

require("core-js/modules/es.function.name");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/includes"));

var _default = {
  excludeEventsWithUids: excludeEventsWithUids,
  formatEventItem: formatEventItem
};
exports.default = _default;

function excludeEventsWithUids(excludedUids, event) {
  var _context;

  return !(0, _includes.default)(_context = excludedUids || []).call(_context, event.uid);
}

function formatEventItem(lang, event) {
  return {
    uid: event.uid,
    title: event.title[lang],
    dateRange: event.dateRange[lang],
    location: {
      name: event.location.name,
      address: event.location.address
    }
  };
}

module.exports = exports.default;
//# sourceMappingURL=helpers.js.map