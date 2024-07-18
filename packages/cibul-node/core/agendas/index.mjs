import Events from './events/index.mjs';
import embeds from './embeds.mjs';
import Settings from './settings/index.mjs';
import create from './create.mjs';
import update from './update.mjs';
import remove from './remove.mjs';
import members from './members/index.mjs';
import locations from './locations/index.mjs';
import get from './get.mjs';
import search from './search.mjs';
import rebuild from './rebuild.mjs';
import flattenMemberInfo from './utils/flattenMemberInfo.mjs';
import clearAgendasCache from './utils/clearAgendasCache.mjs';
import sources from './sources/index.mjs';

export default core => {
  const settings = Settings(core);
  const events = Events(core);

  const agendaEndpoints = agendaUid => {
    const endpoints = {
      get: get.bind(null, core, agendaUid),
      update: update.bind(null, core, agendaUid),
      remove: remove.bind(null, agendaUid),
      events: events(agendaUid),
      locations: locations(core, agendaUid),
      members: members(core, agendaUid),
      settings: settings(agendaUid),
      embeds: embeds(core, agendaUid),
      sources: sources(core, agendaUid),
    };

    endpoints.rebuild = rebuild(core, endpoints, agendaUid);

    return endpoints;
  };

  return Object.assign(agendaEndpoints, {
    search: search(core),
    create: create.bind(null, core),
    rebuildIndex: () => core.services.agendaSearch.rebuild(),
    slug: agendaSlug => ({
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
