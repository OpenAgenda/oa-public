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

// src/messages/provenance.js
var provenance_exports = {};
__export(provenance_exports, {
  default: () => provenance_default
});
module.exports = __toCommonJS(provenance_exports);
var import_react_intl = require("react-intl");
var provenance_default = (0, import_react_intl.defineMessages)({
  contribution: {
    id: "ReactFilters.messages.provenance.contribution",
    defaultMessage: "Contribution"
  },
  aggregation: {
    id: "ReactFilters.messages.provenance.aggregation",
    defaultMessage: "Aggregation"
  },
  share: {
    id: "ReactFilters.messages.provenance.share",
    defaultMessage: "Share"
  }
});
//# sourceMappingURL=provenance.cjs.map