'use strict';

const log = require('@openagenda/logs')('get');
const cleanGetIdentifiers = require('./lib/cleanGetIdentifiers');
const cleanGetOptions = require('./lib/cleanGetOptions');
const getFieldsByAccess = require('./lib/getFieldsByAccess');
const getDatabaseFieldName = require('./lib/databaseField').getName;
const fromDbEntryToItem = require('./lib/fromDbEntryToItem');
const NotFoundError = require('./lib/NotFoundError');
const handleInterface = require('./lib/handleInterface');
const toHTML = require('./lib/toHTML');

module.exports = async (service, identifiers, o = {}) => {
  const k = service.clients.knex(service.config.schema);

  const options = cleanGetOptions(o);

  const {
    throwOnNotFound,
    private: privateOption,
    deleted,
    detailed,
    includeFields,
    html
  } = options;

  const query = k.first(
    getFieldsByAccess('read', 'public')
      .filter(f => includeFields.length ? includeFields.includes(f.field) : true)
      .map(getDatabaseFieldName)
  ).where(cleanGetIdentifiers(identifiers));

  if (typeof privateOption === 'boolean') {
    query.where('private', privateOption);
  }

  if (deleted === true) {
    query.whereNotNull('deleted_at');
  } else if (deleted === false) {
    query.whereNull('deleted_at');
  }

  const entry = await query;

  if (!entry & throwOnNotFound) {
    throw new NotFoundError('event', identifiers);
  } else if (!entry) {
    return null;
  }

  const item = fromDbEntryToItem(service, entry, options);

  if (detailed) {
    item.originAgenda = [].concat(
      await handleInterface(service, 'getOriginAgendas', item.agendaUid, { private: privateOption })
    ).pop();
    item.location = [].concat(
      await handleInterface(service, 'getLocations', item.locationUid)
    ).pop();
  }

  if (html) {
    item.html = toHTML(item.longDescription);
  }

  return item;
}
