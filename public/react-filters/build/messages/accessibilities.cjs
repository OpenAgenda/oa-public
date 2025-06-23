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

// src/messages/accessibilities.js
var accessibilities_exports = {};
__export(accessibilities_exports, {
  default: () => accessibilities_default
});
module.exports = __toCommonJS(accessibilities_exports);
var import_react_intl = require("react-intl");
var accessibilities_default = (0, import_react_intl.defineMessages)({
  hi: {
    id: "ReactFilters.messages.accessiblities.hi",
    defaultMessage: "Hearing impairment"
  },
  vi: {
    id: "ReactFilters.messages.accessiblities.vi",
    defaultMessage: "Visual impairment"
  },
  pi: {
    id: "ReactFilters.messages.accessiblities.pi",
    defaultMessage: "Psychic impairment"
  },
  mi: {
    id: "ReactFilters.messages.accessiblities.mi",
    defaultMessage: "Motor impairment"
  },
  ii: {
    id: "ReactFilters.messages.accessiblities.ii",
    defaultMessage: "Intellectual impairment"
  }
});
//# sourceMappingURL=accessibilities.cjs.map