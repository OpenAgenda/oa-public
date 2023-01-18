'use strict';

const { NotFound } = require('@openagenda/verror');
const getSchemas = require('./getSchemas');
const getNetwork = require('./getNetwork');

module.exports = async (services, agendaOrUid, options = {}) => {
  const {
    detailed = false,
  } = options;

  const agenda = agendaOrUid?.constructor.name === 'Object' ? agendaOrUid : await services.agendas.get({ uid: agendaOrUid }, {
    internal: true,
    private: null,
    includeImagePath: true,
  });

  if (!agenda) {
    throw new NotFound({ info: { uid: agendaOrUid } }, 'agenda not found');
  }

  if (!detailed) {
    return agenda;
  }

  agenda.network = await getNetwork(services, agenda.networkUid);

  const [
    formSchema,
    networkSchema,
  ] = await getSchemas(services, [
    agenda.formSchemaId,
    agenda?.network?.formSchemaId,
  ]);

  if (formSchema) {
    agenda.formSchema = formSchema;
  }

  if (networkSchema) {
    agenda.network.formSchema = networkSchema;
  }

  return agenda;
};
