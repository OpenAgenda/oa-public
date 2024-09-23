'use strict';

const log = require('@openagenda/logs')('get');
const getDatabaseFieldName = require('@openagenda/utils/fields/databaseField').getName;
const cleanGetIdentifiers = require('./lib/cleanGetIdentifiers');
const cleanGetOptions = require('./lib/cleanGetOptions');
const NotFoundError = require('./lib/NotFoundError');
const handleInterface = require('./lib/handleInterface');
const lastClean = require('./lib/lastEventClean');

module.exports = async (service, identifiers, o = {}) => {
  log('called %s with options %j', identifiers, o);

  const {
    clients: { knex },
    config: { schema, imagePath, defaultImage },
    fieldUtils,
  } = service;

  const k = knex(schema);

  const options = cleanGetOptions(o);

  const { private: privateOption, includeFields } = options;

  const query = k
    .first(
      fieldUtils
        .getFieldsByAccess('read', options.access)
        .filter((f) =>
          (includeFields.length ? includeFields.includes(f.field) : true))
        .map(getDatabaseFieldName),
    )
    .where(cleanGetIdentifiers(identifiers));

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

  const item = fieldUtils.fromEntryToItem(entry, options);

  return lastClean(item, {
    ...options,
    locations: options.detailed
      ? await handleInterface(service, 'getLocations', item.locationUid)
      : null,
    agendas: options.detailed
      ? await handleInterface(service, 'getOriginAgendas', item.agendaUid, {
        private: privateOption,
      })
      : null,
    imagePath,
    defaultImage,
  });
};
