import Agendas from './agendas/index.js';
import Networks from './networks/index.js';
import Users from './users/index.js';
import Tasks from './tasks.mjs';
import Events from './events/index.mjs';
import LocationSets from './locationSets/index.js';

import { TYPES as stateChangeTypes } from './agendas/utils/assignState.js';

export default (services, config) => {
  const core = {
    services,
    tasks: Tasks(services),
    getConfig: () => config,
  };

  core.agendas = Agendas(core);
  core.networks = Networks(core);
  core.users = Users(core);
  core.locationSets = LocationSets(core);
  core.events = Events(core);

  services.core = core;

  core.constants = {
    stateChangeTypes,
  };

  return core;
};
