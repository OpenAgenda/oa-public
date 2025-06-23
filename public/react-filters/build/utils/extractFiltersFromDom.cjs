var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/extractFiltersFromDom.js
var extractFiltersFromDom_exports = {};
__export(extractFiltersFromDom_exports, {
  default: () => extractFiltersFromDom
});
module.exports = __toCommonJS(extractFiltersFromDom_exports);
var import_react = __toESM(require("react"), 1);
function extractFiltersFromDom() {
  const filterElems = document.querySelectorAll("[data-oa-filter]");
  return Array.from(filterElems, (elem) => {
    const paramsAttr = elem.getAttribute("data-oa-filter-params");
    const dataSet = JSON.parse(paramsAttr);
    dataSet.destSelector = `[data-oa-filter="${elem.getAttribute("data-oa-filter")}"][data-oa-filter-params="${paramsAttr.replace(
      /["\\]/g,
      "\\$&"
    )}"]`;
    dataSet.elem = elem;
    if (dataSet.type === "custom" || dataSet.type === "favorites") {
      dataSet.handlerElem = dataSet.handlerSelector ? elem.querySelector(dataSet.handlerSelector) : null;
    } else {
      dataSet.elemRef = import_react.default.createRef();
    }
    return dataSet;
  });
}
//# sourceMappingURL=extractFiltersFromDom.cjs.map