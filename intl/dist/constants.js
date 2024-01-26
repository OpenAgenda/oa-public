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

// src/constants.js
var constants_exports = {};
__export(constants_exports, {
  DEFAULT_FALLBACK_MAP: () => DEFAULT_FALLBACK_MAP,
  DEFAULT_LANG: () => DEFAULT_LANG,
  DEFAULT_LANGS: () => DEFAULT_LANGS
});
module.exports = __toCommonJS(constants_exports);
var DEFAULT_LANG = "en";
var DEFAULT_LANGS = ["en", "fr", "de", "it", "es", "br", "ca", "eu", "oc", "io"];
var DEFAULT_FALLBACK_MAP = {
  br: "fr",
  ca: "es",
  eu: "es",
  oc: "fr"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_FALLBACK_MAP,
  DEFAULT_LANG,
  DEFAULT_LANGS
});
