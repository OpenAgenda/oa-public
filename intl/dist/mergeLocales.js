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

// src/mergeLocales.js
var mergeLocales_exports = {};
__export(mergeLocales_exports, {
  default: () => mergeLocales
});
module.exports = __toCommonJS(mergeLocales_exports);
function mergeLocales(target, ...sources) {
  const output = { ...target };
  for (const source of sources) {
    Object.keys(source).forEach((key) => {
      if (!(key in output)) {
        output[key] = source[key];
      } else {
        output[key] = Object.assign(output[key], source[key]);
      }
    });
  }
  return output;
}
