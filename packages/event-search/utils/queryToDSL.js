import getDSLNav from './getDSLNavPart.js';
import getDSLQueryPart from './getDSLQueryPart.js';
import getDSLSortPart from './getDSLSortPart.js';
import getDSLSourcePart from './getDSLSourcePart.js';

export default (query = {}, nav = {}, options = {}) => {
  const {
    formSchema = null,
    includes = null,
    emptyValue,
    removed = false,
    valid = null,
    access,
    // Callers that already resolved the sort (e.g. search.js, to size the
    // cutoff cursor) pass it in to avoid building the nested-sort DSL twice.
    sort = getDSLSortPart(query),
  } = options;

  const DSL = {
    track_total_hits: true,
    query: getDSLQueryPart(query, {
      formSchema,
      emptyValue,
      removed,
      valid,
      access,
    }),
    _source: getDSLSourcePart(includes),
  };

  if (sort) DSL.sort = sort;

  return nav ? Object.assign(DSL, getDSLNav(nav)) : DSL;
};
