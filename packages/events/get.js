'use strict';

const log = require('@openagenda/logs')('get');
const cleanGetIdentifiers = require('./lib/cleanGetIdentifiers');
const cleanGetOptions = require('./lib/cleanGetOptions');
const getFieldsByAccess = require('./lib/getFieldsByAccess');
const getDatabaseFieldName = require('./lib/databaseField').getName;
const fromDbEntryToItem = require('./lib/fromDbEntryToItem');
const NotFoundError = require('./lib/NotFoundError');
const handleInterface = require('./lib/handleInterface');
const lastClean = require('./lib/lastEventClean');

module.exports = async (service, identifiers, o = {}) => {
  log('called', identifiers);
  const k = service.clients.knex(service.config.schema);

  const options = cleanGetOptions(o);

  const {
    private: privateOption,
    includeFields
  } = options;

  const query = k.first(
    getFieldsByAccess('read', options.access)
      .filter(f => (includeFields.length ? includeFields.includes(f.field) : true))
      .map(getDatabaseFieldName)
  ).where(cleanGetIdentifiers(identifiers));

  if (typeof privateOption === 'boolean') {
    query.where('private', privateOption);
  }

  if (options.deleted === true) {
    query.whereNotNull('deleted_at');
  } else if (options.deleted === false) {
    query.whereNull('deleted_at');
  }

  const entry = await query;

  if (!entry && options.throwOnNotFound) {
    throw new NotFoundError('event', identifiers);
  } else if (!entry) {
    return null;
  }

  const item = fromDbEntryToItem(service, entry, options);

  return lastClean(item, {
    ...options,
    locations: options.detailed ? await handleInterface(service, 'getLocations', item.locationUid) : null,
    agendas: options.detailed ? await handleInterface(service, 'getOriginAgendas', item.agendaUid, { private: privateOption }) : null,
    imagePath: service.config.imagePath,
    defaultImage: service.config.defaultImage
  });
};
