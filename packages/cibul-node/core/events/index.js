const search = (core) => (query, nav, options) => {
  const {
    services: { eventSearch },
  } = core;

  return eventSearch.transverse.search(query, nav, options);
};

export default (core) => ({
  search: search(core),
});
