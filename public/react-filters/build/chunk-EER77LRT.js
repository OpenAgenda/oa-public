import {
  __glob
} from "./chunk-EVM6BVMO.js";

// import("../locales-compiled/**/*.json") in src/utils/fetchLocale.js
var globImport_locales_compiled_json = __glob({
  "../locales-compiled/br.json": () => import("./locales-compiled/br.js"),
  "../locales-compiled/ca.json": () => import("./locales-compiled/ca.js"),
  "../locales-compiled/de.json": () => import("./locales-compiled/de.js"),
  "../locales-compiled/en.json": () => import("./locales-compiled/en.js"),
  "../locales-compiled/es.json": () => import("./locales-compiled/es.js"),
  "../locales-compiled/eu.json": () => import("./locales-compiled/eu.js"),
  "../locales-compiled/fr.json": () => import("./locales-compiled/fr.js"),
  "../locales-compiled/io.json": () => import("./locales-compiled/io.js"),
  "../locales-compiled/it.json": () => import("./locales-compiled/it.js"),
  "../locales-compiled/oc.json": () => import("./locales-compiled/oc.js")
});

// src/utils/fetchLocale.js
function fetchLocale(locale) {
  return globImport_locales_compiled_json(`../locales-compiled/${locale}.json`).then(
    (mod) => mod.default
  );
}

export {
  fetchLocale
};
//# sourceMappingURL=chunk-EER77LRT.js.map