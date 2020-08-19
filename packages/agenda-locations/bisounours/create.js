'use strict';

const log = require('@openagenda/logs')('create');

const cleanOptions = require('./lib/cleanSetOptions');
const validate = require('./lib/validate');
const fromItemToDbEntry = require('./lib/fromItemToDbEntry');
const defineUniqueUID = require('./lib/defineUniqueUID');

async function create(service, data, options = {}) {
  log('received %j payload', data.name);

  const {
    context
  } = cleanOptions(options);

  const clean = {
    ...validate(data),
    uid: await defineUniqueUID(service),
    createdAt: new Date,
    updatedAt: new Date
  };

  if (context.agendaUid) {
    clean.agendaId = await service.interfaces.getAgendaIdByUid(context.agendaUid);
  }

  const entry = fromItemToDbEntry(clean);

  const [ insertedID ] = await service.clients
    .knex(service.config.schema)
    .insert(entry);

  log('created with id %s and uid %s', insertedID, entry.uid);

  return clean;
}

module.exports.byAgendaUid = async (
  service,
  agendaUid,
  data,
  options = {}
) => create(service, data, {
  ...options,
  context: { agendaUid }
});
