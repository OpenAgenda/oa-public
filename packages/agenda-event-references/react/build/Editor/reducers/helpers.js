"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  excludeEventsWithUids: excludeEventsWithUids,
  formatEventItem: formatEventItem
};
exports.default = _default;

function excludeEventsWithUids(excludedUids, event) {
  return !(excludedUids || []).includes(event.uid);
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