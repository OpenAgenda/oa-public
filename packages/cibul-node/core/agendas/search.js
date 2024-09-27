export default (core) => (query, nav, options) => {
  const {
    services: { agendaSearch },
  } = core;

  return agendaSearch(query, nav, options);
};
