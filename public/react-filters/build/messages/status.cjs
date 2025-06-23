var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/messages/status.js
var status_exports = {};
__export(status_exports, {
  default: () => status_default
});
module.exports = __toCommonJS(status_exports);
var import_react_intl = require("react-intl");
var status_default = (0, import_react_intl.defineMessages)({
  programmed: {
    id: "ReactFilters.messages.status.programmed",
    // 1
    defaultMessage: "Programmed"
  },
  rescheduled: {
    id: "ReactFilters.messages.status.rescheduled",
    // 2
    defaultMessage: "Rescheduled"
  },
  movedOnline: {
    id: "ReactFilters.messages.status.movedOnline",
    // 3
    defaultMessage: "Moved online"
  },
  postponed: {
    id: "ReactFilters.messages.status.postponed",
    // 4
    defaultMessage: "Postponed"
  },
  full: {
    id: "ReactFilters.messages.status.full",
    // 5
    defaultMessage: "Fully booked"
  },
  cancelled: {
    id: "ReactFilters.messages.status.cancelled",
    // 6
    defaultMessage: "Cancelled"
  }
});
//# sourceMappingURL=status.cjs.map