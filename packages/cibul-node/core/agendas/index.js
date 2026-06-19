import Events from './events/index.js';
import Settings from './settings/index.js';
import create from './create.js';
import update from './update.js';
import remove from './remove.js';
import members from './members/index.js';
import locations from './locations/index.js';
import get from './get.js';
import search from './search.js';
import rebuild from './rebuild.js';
import flattenMemberInfo from './utils/flattenMemberInfo.js';
import clearAgendasCache from './utils/clearAgendasCache.js';
import loadSummary from './utils/loadSummary.js';
import loadOverview from './utils/loadOverview.js';
import sources from './sources/index.js';

export default (core) => {
  const settings = Settings(core);
  const events = Events(core);

  const agendaEndpoints = (agendaUid) => {
    const endpoints = {
      get: get.bind(null, core, agendaUid),
      update: update.bind(null, core, agendaUid),
      remove: remove.bind(null, core, agendaUid),
      events: events(agendaUid),
      locations: locations(core, agendaUid),
      members: members(core, agendaUid),
      settings: settings(agendaUid),
      sources: sources(core, agendaUid),
      summary: loadSummary.agendaAndSummary.bind(null, core, agendaUid),
      overview: loadOverview.agendaAndOverview.bind(null, core, agendaUid),
    };

    endpoints.rebuild = rebuild(core, endpoints, agendaUid);

    return endpoints;
  };

  return Object.assign(agendaEndpoints, {
    search: search(core),
    create: create.bind(null, core),
    rebuildIndex: () => core.services.agendaSearch.rebuild(),
    slug: (agendaSlug) => ({
      get: get.slug.bind(null, core, agendaSlug),
    }),
    utils: {
      flattenMemberInfo,
      clearAgendasCache: clearAgendasCache.bind(null, core.services),
    },
    tasks: () => {
      members.tasks(core);
    },
  });
};
