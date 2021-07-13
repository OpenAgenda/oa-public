'use strict';

const log = require('@openagenda/logs')('get');
const NotFoundError = require('@openagenda/utils/errors/NotFoundError');
const BadRequestError = require('@openagenda/utils/errors/BadRequestError');
const cleanGetIdentifiers = require('./lib/cleanGetIdentifiers');
const cleanGetOptions = require('./lib/cleanGetOptions');
const addGetQuery = require('./lib/addGetQuery');
const addSelect = require('./lib/addSelect');
const decorateWithCounts = require('./lib/decorateWithCounts');
const pickContextIdentifiers = require('./lib/pickContextIdentifiers');
const legacy = require('./lib/legacy');

async function get(service, identifiers, options = {}) {
  log('received %j %j %j', identifiers, options, service);
  const k = service.clients.knex(service.config.schema);
  const {
    eventCounts: includeEventCounts,
    context,
    includeImagePath,
    includeFields,
    throwOnNotFound,
    includeLinkedAgendas,
    deleted,
  } = cleanGetOptions(options);

  await addGetQuery(service, k, deleted, {
    ...cleanGetIdentifiers(identifiers),
    ...pickContextIdentifiers(context, ['agendaUid', 'setUid']),
  });

  addSelect(k, 'public', { first: true, includeFields });
  const entry = await k;
  const location = entry ? service.fieldUtils.fromEntryToItem(entry, {
    includeFields,
    access: 'public',
  }) : null;
  if (!location) {
    if (throwOnNotFound) {
      throw new NotFoundError('location', identifiers);
    }
    return null;
  }

  if (service.interfaces.getEventCounts && includeEventCounts) {
    decorateWithCounts(
      location,
      await service.interfaces.getEventCounts([location.uid], context)
    );
  }

  if (service.interfaces.getLinkedAgendas && includeLinkedAgendas) {
    location.linkedAgendas = await service.interfaces.getLinkedAgendas(location.uid);
  }

  if (includeImagePath && service.config.imagePath) {
    location.image = service.config.imagePath + location.image;
  }

  return legacy.load(location, entry);
}

module.exports = get;

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  identifiers,
  options = {}
) => {
  if (!agendaUid) {
    throw new BadRequestError('agenda identifier is missing');
  }
  return get(service, identifiers, { ...options, context: { agendaUid } });
};

module.exports.bySetUid = async (service, setUid, identifiers, options = {}) => {
  if (!setUid) {
    throw new BadRequestError('set identifier is missing');
  }
  return get(service, identifiers, { ...options, context: { setUid } });
};
