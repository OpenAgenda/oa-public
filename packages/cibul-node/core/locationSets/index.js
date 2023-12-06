'use strict';

function get(core, locationSetUid) {
  const {
    services,
  } = core;

  return services.agendaLocations.sets.get(locationSetUid);
}

module.exports = core => locationSetUid => ({
  get: get.bind(null, core, locationSetUid),
});
