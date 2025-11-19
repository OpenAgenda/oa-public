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
  } = options;

  const DSL = {
    track_total_hits: true,
    query: getDSLQueryPart(query, { formSchema, emptyValue, removed, valid }),
    _source: getDSLSourcePart(includes),
  };

  const sort = getDSLSortPart(query);

  if (sort) DSL.sort = sort;

  return nav ? Object.assign(DSL, getDSLNav(nav)) : DSL;
};
