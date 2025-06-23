import {
  getQuerySeparator
} from "./chunk-7E6CJSI4.js";
import {
  filtersToAggregations
} from "./chunk-TWJ2L7HC.js";

// src/api/getEvents.js
import qs from "qs";
async function getEvents(_apiClient, jsonExportRes, agenda, filters, query, pageParam, filtersBase, pageSize = 20, searchMethod = "get") {
  const params = {
    aggsSizeLimit: 1500,
    aggs: filtersToAggregations(filters, filtersBase),
    from: pageParam > 1 ? (pageParam - 1) * pageSize : void 0,
    ...query
  };
  const url = jsonExportRes.replace(":slug", agenda.slug).replace(":uid", agenda.uid);
  const p = searchMethod === "get" ? fetch(
    `${url}${getQuerySeparator(url)}${qs.stringify(params, {
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

export {
  getEvents
};
//# sourceMappingURL=chunk-M6FAEUC6.js.map