import Agendas from './agendas/index.mjs';
import Networks from './networks/index.mjs';
import Users from './users/index.mjs';
import Tasks from './tasks.mjs';
import Events from './events/index.mjs';
import LocationSets from './locationSets/index.mjs';

import { TYPES as stateChangeTypes } from './agendas/utils/assignState.mjs';

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
