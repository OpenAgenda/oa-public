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

// src/messages/map.js
var map_exports = {};
__export(map_exports, {
  default: () => map_default
});
module.exports = __toCommonJS(map_exports);
var import_react_intl = require("react-intl");
var map_default = (0, import_react_intl.defineMessages)({
  searchHere: {
    id: "ReactFilters.messages.map.searchHere",
    defaultMessage: "Search here"
  }
});
//# sourceMappingURL=map.cjs.map