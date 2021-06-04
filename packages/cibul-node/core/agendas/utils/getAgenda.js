'use strict';

const getNetwork = require('./getNetwork');
const getSchemas = require('./getSchemas');
const NotFoundError = require('../../utils/NotFoundError');

module.exports = async (services, agendaOrUid, options = {}) => {
  const {
    detailed
  } = {
    detailed: false,
    ...options
  };

  const agenda = agendaOrUid?.constructor.name === 'Object' ? agendaOrUid : await services.agendas.get({ uid: agendaOrUid }, {
    internal: true,
    private: null,
    includeImagePath: true
  });

  if (!agenda) {
    throw new NotFoundError('agenda', agendaOrUid);
  }

  if (!detailed) {
    return agenda;
  }

  agenda.network = await getNetwork(services, agenda.networkUid);

  const [
    formSchema,
    networkSchema
  ] = await getSchemas(services, [
    agenda.formSchemaId,
    agenda?.network?.formSchemaId
  ]);

  if (formSchema) {
    agenda.formSchema = formSchema;
  }

  if (networkSchema) {
    agenda.network.formSchema = networkSchema;
  }

  return agenda;
};
