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

// src/components/Total.js
var Total_exports = {};
__export(Total_exports, {
  default: () => Total
});
module.exports = __toCommonJS(Total_exports);
var import_react_intl = require("react-intl");
function Total({
  message,
  total,
  totalLabel,
  totalLabelPlural
}) {
  const intl = (0, import_react_intl.useIntl)();
  return intl.formatMessage(message, { total, totalLabel, totalLabelPlural });
}
//# sourceMappingURL=Total.cjs.map