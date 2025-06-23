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

// src/api/getEvents.js
var getEvents_exports = {};
__export(getEvents_exports, {
  default: () => getEvents
});
module.exports = __toCommonJS(getEvents_exports);
var import_qs = __toESM(require("qs"), 1);

// src/utils/minimizeAggregation.js
var shortKeys = [
  {
    short: "m",
    key: "missing"
  },
  {
    short: "s",
    key: "size"
  },
  {
    short: "t",
    key: "type"
  },
  {
    short: "k",
    key: "key"
  },
  {
    short: "f",
    key: "field"
  }
];
var shortValues = [
  {
    key: "type",
    short: "af",
    value: "additionalFields"
  }
];
function minimizeAggregation(aggregation) {
  if (typeof aggregation === "string") {
    return aggregation;
  }
  return Object.keys(aggregation).reduce(
    (carry, key) => {
      var _a, _b;
      return {
        ...carry,
        [((_a = shortKeys.find((shortKey) => shortKey.key === key)) == null ? void 0 : _a.short) ?? key]: ((_b = shortValues.find(
          (shortValue) => shortValue.key === key && aggregation[key] === shortValue.value
        )) == null ? void 0 : _b.short) ?? aggregation[key]
      };
    },
    {}
  );
}

// src/utils/filtersToAggregations.js
function filtersToAggregations(filters, base = false) {
  const usedFilters = base ? filters.filter(
    (filter) => filter.type === "choice" && (!filter.options || filter.missingValue)
  ) : filters;
  const aggregations = usedFilters.map((filter) => {
    if (filter.aggregation === null) {
      return false;
    }
    return {
      key: filter.name,
      type: filter.name,
      missing: filter.missingValue,
      ...filter.aggregation
    };
  }).filter((filter) => filter == null ? void 0 : filter.key);
  const needViewport = usedFilters.some((filter) => filter.type === "map");
  if (needViewport) {
    aggregations.unshift({
      key: "viewport",
      type: "viewport"
    });
  }
  return aggregations.map(minimizeAggregation);
}

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

// src/api/getEvents.js
async function getEvents(_apiClient, jsonExportRes, agenda, filters, query, pageParam, filtersBase, pageSize = 20, searchMethod = "get") {
  const params = {
    aggsSizeLimit: 1500,
    aggs: filtersToAggregations(filters, filtersBase),
    from: pageParam > 1 ? (pageParam - 1) * pageSize : void 0,
    ...query
  };
  const url = jsonExportRes.replace(":slug", agenda.slug).replace(":uid", agenda.uid);
  const p = searchMethod === "get" ? fetch(
    `${url}${getQuerySeparator(url)}${import_qs.default.stringify(params, {
      skipNulls: true
    })}`
  ) : fetch(url, {
    method: "post",
    body: JSON.stringify(params),
    headers: {
      "Content-Type": "application/json"
    }
  });
  return p.then((r) => {
    if (r.ok) return r.json();
    throw new Error("Can't list events");
  });
}
//# sourceMappingURL=getEvents.cjs.map