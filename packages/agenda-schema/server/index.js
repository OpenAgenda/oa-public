"use strict";

const router = require('./router');

module.exports = Object.assign((config = {}) => {
  const load = loadServiceResources.bind(null, config.interfaces);

  return {
    name: 'agenda-schema',
    config,
    loadAppResources: loadAppResources.bind(null, load),
    setSchemaFields: setSchemaFields.bind(null, load, config.interfaces.setSchemaFields)
  };

}, { router });

async function setSchemaFields(load, setSchemaFields, agendaIdentifiers, update) {
  const { agenda } = await load(agendaIdentifiers);

  return setSchemaFields(agenda, update);
}

async function loadAppResources(load, agendaIdentifiers) {
  const { agenda, schema, extensions } = await load(agendaIdentifiers);

  return {
    agenda,
    schema,
    maxFields: agenda?.credentials?.premiumCustomFields ? 100 : 1,
    extensions,
    editableExtensions: (!!agenda?.credentials?.premiumCustomFields) || ['timings']
  }
}


async function loadServiceResources({ getAgenda, getSchema, getSchemaExtensions }, agendaIdentifiers) {
  const agenda = await getAgenda(agendaIdentifiers);

  if (!agenda) throw new Error('Could not find agenda');

  const schema = await getSchema(agenda);

  const extensions = await getSchemaExtensions(agenda);

  return {
    agenda,
    schema,
    extensions
  };
}
