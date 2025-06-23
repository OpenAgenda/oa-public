import {
  withDefaultFilterConfig
} from "./chunk-3EOZOFPD.js";

// src/utils/getFiltersBase.js
function getFiltersBase(fields, opts = {}) {
  return [
    { name: "memberUid" },
    { name: "locationUid" },
    { name: "sourceAgendaUid" },
    { name: "originAgendaUid" },
    { name: "country" },
    { name: "region" },
    { name: "department" },
    { name: "city" },
    { name: "adminLevel3" },
    { name: "district" },
    { name: "keyword" }
  ].filter((filter) => {
    var _a;
    return !((_a = opts.exclude) == null ? void 0 : _a.includes(filter.name));
  }).map((filter) => withDefaultFilterConfig(filter, null, {
    dateFnsLocale: opts.dateFnsLocale,
    mapTiles: opts.mapTiles,
    missingValue: opts.missingValue
  }));
}

export {
  getFiltersBase
};
//# sourceMappingURL=chunk-JBB2UUEE.js.map