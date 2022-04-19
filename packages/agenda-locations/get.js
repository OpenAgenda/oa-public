'use strict';

const { BadRequest, NotFound } = require('@openagenda/verror');
const cleanGetIdentifiers = require('./lib/cleanGetIdentifiers');
const cleanGetOptions = require('./lib/cleanGetOptions');
const addGetQuery = require('./lib/addGetQuery');
const addSelect = require('./lib/addSelect');
const decorateWithCounts = require('./lib/decorateWithCounts');
const pickContextIdentifiers = require('./lib/pickContextIdentifiers');
const legacy = require('./lib/legacy');
const getMergedLocation = require('./lib/getMergedLocation');
const log = require('@openagenda/logs')('get');

async function get({ internals, endpoints }, identifiers, options = {}) {
  log('received %j %j', identifiers, options);
  const k = internals.clients.knex(internals.config.schema);
  const {
    eventCounts: includeEventCounts,
    endpointId,
    context,
    includeImagePath,
    includeFields,
    throwOnNotFound,
    includeLinkedAgendas,
    deleted,
    returnMergeTarget,
  } = cleanGetOptions(options);

  await addGetQuery(internals, k, deleted, {
    ...cleanGetIdentifiers(identifiers),
    ...pickContextIdentifiers(endpointId, ['agendaUid', 'setUid']),
  });

  addSelect(k, 'public', { first: true, includeFields });
  if ((includeFields ?? []).includes('agendaUid')) {
    k.select('agenda_id');
  }
  const entry = await k;

  const location = entry ? internals.fieldUtils.fromEntryToItem(entry, {
    includeFields,
    access: 'public',
  }) : null;
  if (returnMergeTarget) {
    return getMergedLocation(endpoints, identifiers, location, options);
  }
  if (!location) {
    if (throwOnNotFound) {
      throw new NotFound({ info: identifiers }, 'location not found');
    }
    return null;
  }

  if (internals.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      location,
      await internals.interfaces.getEventCounts([location.uid], context)
    );
  }

  if (internals.interfaces.getAgendaUidsByIds && (includeFields ?? []).includes('agendaUid')) {
    location.agendaUid = (
      await internals.interfaces.getAgendaUidsByIds(entry.agenda_id)
    )?.uid;
  }

  if (internals.interfaces.getLinkedAgendas && includeLinkedAgendas) {
    location.linkedAgendas = await internals.interfaces.getLinkedAgendas(location.uid);
  }

  if (includeImagePath && internals.config.imagePath && location.image) {
    location.image = internals.config.imagePath + location.image;
  }

  return legacy.load(location, entry);
}

module.exports = get;

module.exports.byAgendaUid = async (
  { internals, endpoints },
  agendaUid,
  identifiers,
  options = {}
) => {
  if (!agendaUid) {
    throw new BadRequest('agenda identifier is missing');
  }
  return get({ internals, endpoints }, identifiers, { ...options, endpointId: { agendaUid } });
};

module.exports.bySetUid = async ({ internals, endpoints }, setUid, identifiers, options = {}) => {
  if (!setUid) {
    throw new BadRequest('set identifier is missing');
  }
  return get({ internals, endpoints }, identifiers, { ...options, endpointId: { setUid } });
};
