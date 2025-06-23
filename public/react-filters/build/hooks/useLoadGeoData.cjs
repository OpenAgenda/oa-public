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

// src/hooks/useLoadGeoData.js
var useLoadGeoData_exports = {};
__export(useLoadGeoData_exports, {
  default: () => useLoadGeoData
});
module.exports = __toCommonJS(useLoadGeoData_exports);
var import_react = require("react");
var import_qs = __toESM(require("qs"), 1);

// src/utils/getQuerySeparator.js
function getQuerySeparator(url) {
  try {
    const urlObj = new URL(url, "http://n");
    return urlObj.search ? "&" : "?";
  } catch (error) {
    console.error("Invalid URL:", error);
    return "?";
  }
}

// src/hooks/useLoadGeoData.js
function useLoadGeoData(_apiClient, res, queryOrFn, options = {}) {
  const { searchMethod = "get" } = options;
  return (0, import_react.useCallback)(
    async (bounds, zoom) => {
      const query = typeof queryOrFn === "function" ? queryOrFn() : queryOrFn;
      const northEast = bounds.getNorthEast().wrap();
      const southWest = bounds.getSouthWest().wrap();
      const params = {
        // oaq: { passed: 1 },
        size: 0,
        ...query,
        aggregations: [
          {
            type: "geohash",
            size: 2e3,
            zoom: Math.max(zoom, 1),
            radius: zoom === 0 ? 80 : 40
          }
        ],
        geo: {
          northEast,
          southWest
        }
      };
      const result = await (searchMethod === "get" ? fetch(
        `${res}${getQuerySeparator(res)}${import_qs.default.stringify(params, {
          skipNulls: true
        })}`
      ) : fetch(res, {
        method: "post",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json"
        }
      })).then((r) => {
        if (r.ok) return r.json();
        throw new Error("Can't load geo data");
      });
      return result.aggregations.geohash;
    },
    [res, queryOrFn, searchMethod]
  );
}
//# sourceMappingURL=useLoadGeoData.cjs.map