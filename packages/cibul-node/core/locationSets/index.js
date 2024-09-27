function get(core, locationSetUid) {
  const { services } = core;

  return services.agendaLocations.sets.get(locationSetUid);
}

export default (core) => (locationSetUid) => ({
  get: get.bind(null, core, locationSetUid),
});
