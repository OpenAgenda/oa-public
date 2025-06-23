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

// src/utils/extractWidgetsFromDom.js
var extractWidgetsFromDom_exports = {};
__export(extractWidgetsFromDom_exports, {
  default: () => extractWidgetsFromDom
});
module.exports = __toCommonJS(extractWidgetsFromDom_exports);
function extractWidgetsFromDom() {
  const widgetElems = document.querySelectorAll("[data-oa-widget]");
  return Array.from(widgetElems, (elem) => {
    const paramsAttr = elem.getAttribute("data-oa-widget-params");
    const dataSet = JSON.parse(paramsAttr);
    dataSet.destSelector = `[data-oa-widget="${elem.getAttribute("data-oa-widget")}"][data-oa-widget-params="${paramsAttr.replace(
      /["\\]/g,
      "\\$&"
    )}"]`;
    dataSet.elem = elem;
    if (dataSet.name === "favorite") {
      dataSet.handlerElem = dataSet.handlerSelector ? elem.querySelector(dataSet.handlerSelector) : null;
      dataSet.activeTargetElem = dataSet.activeTargetSelector ? elem.querySelector(dataSet.activeTargetSelector) : null;
    }
    return dataSet;
  });
}
//# sourceMappingURL=extractWidgetsFromDom.cjs.map