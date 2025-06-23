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

// src/messages/featured.js
var featured_exports = {};
__export(featured_exports, {
  default: () => featured_default
});
module.exports = __toCommonJS(featured_exports);
var import_react_intl = require("react-intl");
var featured_default = (0, import_react_intl.defineMessages)({
  featured: {
    id: "ReactFilters.messages.featured.featured",
    defaultMessage: "Featured"
  }
});
//# sourceMappingURL=featured.cjs.map