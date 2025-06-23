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

// src/utils/customFirst.js
var customFirst_exports = {};
__export(customFirst_exports, {
  default: () => customFirst
});
module.exports = __toCommonJS(customFirst_exports);
function customFirst(a, b) {
  if (a.type === "custom" && b.type !== "custom") {
    return -1;
  }
  if (a.type !== "custom" && b.type === "custom") {
    return 1;
  }
  return 0;
}
//# sourceMappingURL=customFirst.cjs.map