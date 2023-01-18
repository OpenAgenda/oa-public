'use strict';

const log = require('@openagenda/logs')('core/agendas/get');
const {
  NotFound,
} = require('@openagenda/verror');
const getMergedSchema = require('./settings/getMergedSchema');
const loadSummary = require('./utils/loadSummary');
const extractMemberSchema = require('./utils/extractMemberSchema');

function cacheAndReturn(services, options, agendaUid, result) {
  const {
    simpleCache,
  } = services;
  const {
    useCache,
  } = options;

  if (useCache) {
    simpleCache.hash('core.agendas.get', agendaUid).set(options, result);
  }

  if (options.serializable) {
    ['updatedAt', 'createdAt', 'officializedAt'].forEach(key => {
      result[key] = result[key].toISOString();
    });
  }

  return result;
}

async function get(core, agendaUid, options = {}) {
  const {
    services,
  } = core;

  const {
    agendas,
    simpleCache,
  } = services;

  const {
    access = 'public',
    detailed = false,
    includeEvent = false,
    includeAgendaEvent = false,
    includeOriginAgenda = false,
    includeMember = false,
    includeDateRange = false,
    throwNotFound = false,
    includeNonDataFields = false,
    useCache = false,
    includeMemberSchema = false,
    includeSplitMemberSchema = false,
    actingMember = null,
  } = options;

  log('getting agenda %s, info with access %s', agendaUid, access);

  if (useCache) {
    const cached = await simpleCache.hash('core.agendas.get', agendaUid).get(options, { json: true });
    if (cached) {
      return cached;
    }
  }

  const agenda = await agendas.get({ uid: agendaUid }, {
    includeImagePath: true,
    ...options,
    detailed: false,
    internal: true,
  });

  if (!agenda && throwNotFound) {
    throw new NotFound({ info: { uid: agendaUid } }, 'agenda not found');
  } else if (!agenda) {
    return cacheAndReturn(services, options, agendaUid, null);
  }

  if (!detailed && !includeEvent) {
    return cacheAndReturn(
      services,
      options,
      agendaUid,
      access === 'internal' ? agenda : agendas.utils.filterByAccess(agenda, 'read', access),
    );
  }

  log('getting detailed info with access %s', access);
  const related = {};
  try {
    related.summary = await loadSummary(core, agenda, { access });
  } catch (error) {
    log('error', error);
  }

  related.network = detailed && agenda.networkUid ? await services.networks.get(agenda.networkUid) : null;
  related.locationSet = await services.agendaLocations.sets.get(agenda.locationSetUid);

  related.schema = await getMergedSchema(services, agenda, {
    includeNonDataFields,
    includeEvent,
    includeMember,
    includeMemberSchema,
    includeDateRange,
    includeAgendaEvent,
    includeOriginAgenda,
    actingMember,
    access: typeof access === 'string' ? { read: access } : access,
  });

  if (includeMemberSchema) {
    related.memberSchema = await extractMemberSchema(services, {
      schema: related.schema,
      includeSplitMemberSchema,
      access,
      actingMember,
      agenda,
    });
  }

  if (access === 'internal') {
    return cacheAndReturn(
      services,
      options,
      agendaUid,
      { ...agenda, ...related },
    );
  }

  return cacheAndReturn(
    services,
    options,
    agendaUid,
    {
      ...agendas.utils.filterByAccess(agenda, 'read', access),
      ...related,
    },
  );
}

async function bySlug(core, slug, options = {}) {
  const {
    services,
  } = core;

  const {
    simpleCache,
    agendas,
  } = services;

  const cachedAgenda = await simpleCache.hash('agendas', slug).get('api', { json: true });

  if (cachedAgenda) {
    return get(core, cachedAgenda.uid, options);
  }

  const agenda = await agendas.get({ slug }, { private: null, internal: true });

  simpleCache.hash('agendas', slug).set('api', agenda);

  return get(core, agenda.uid, options);
}

module.exports = Object.assign(get, {
  slug: bySlug,
});
