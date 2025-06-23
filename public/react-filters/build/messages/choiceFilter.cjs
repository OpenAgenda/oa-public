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

// src/messages/choiceFilter.js
var choiceFilter_exports = {};
__export(choiceFilter_exports, {
  default: () => choiceFilter_default
});
module.exports = __toCommonJS(choiceFilter_exports);
var import_react_intl = require("react-intl");
var choiceFilter_default = (0, import_react_intl.defineMessages)({
  noResult: {
    id: "ReactFilters.messages.choiceFilter.noResult",
    defaultMessage: "No result"
  },
  searchPlaceholder: {
    id: "ReactFilters.messages.choiceFilter.searchPlaceholder",
    defaultMessage: "Search"
  },
  moreOptions: {
    id: "ReactFilters.messages.choiceFilter.moreOptions",
    defaultMessage: "More options"
  },
  lessOptions: {
    id: "ReactFilters.messages.choiceFilter.lessOptions",
    defaultMessage: "Less options"
  },
  unrecognizedOption: {
    id: "ReactFilters.messages.choiceFilter.unrecognizedOption",
    defaultMessage: "Unknown filter value ({value})"
  }
});
//# sourceMappingURL=choiceFilter.cjs.map