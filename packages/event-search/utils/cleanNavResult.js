export default (query, { sort }, { useAfterKey, total, events }) => {
  let cleanSort = Array.isArray(sort) ? sort.map((s) => `${s}`) : sort;

  if (total === events?.length) {
    cleanSort = null;
  }

  if (!useAfterKey) {
    return {
      sort: cleanSort,
    };
  }

  return {
    after: cleanSort,
    sort: query.sort,
  };
};
