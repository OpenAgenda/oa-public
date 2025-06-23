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

// src/messages/attendanceMode.js
var attendanceMode_exports = {};
__export(attendanceMode_exports, {
  default: () => attendanceMode_default
});
module.exports = __toCommonJS(attendanceMode_exports);
var import_react_intl = require("react-intl");
var attendanceMode_default = (0, import_react_intl.defineMessages)({
  offline: {
    id: "ReactFilters.messages.attendanceMode.offline",
    defaultMessage: "In situ"
  },
  online: {
    id: "ReactFilters.messages.attendanceMode.online",
    defaultMessage: "Online"
  },
  mixed: {
    id: "ReactFilters.messages.attendanceMode.mixed",
    defaultMessage: "Mixed"
  }
});
//# sourceMappingURL=attendanceMode.cjs.map