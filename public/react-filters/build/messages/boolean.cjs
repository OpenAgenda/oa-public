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

// src/messages/boolean.js
var boolean_exports = {};
__export(boolean_exports, {
  default: () => boolean_default
});
module.exports = __toCommonJS(boolean_exports);
var import_react_intl = require("react-intl");
var boolean_default = (0, import_react_intl.defineMessages)({
  selected: {
    id: "ReactFilters.messages.boolean.selected",
    defaultMessage: "Selected"
  },
  notSelected: {
    id: "ReactFilters.messages.boolean.notSelected",
    defaultMessage: "Not selected"
  }
});
//# sourceMappingURL=boolean.cjs.map