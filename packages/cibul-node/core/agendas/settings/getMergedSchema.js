'use strict';

const _ = require('lodash');

const getAgenda = require('../utils/getAgenda');
const getNetwork = require('../utils/getNetwork');

module.exports = async (services, agendaOrUid, options = {}) => {
  const {
    formSchemas
  } = services;

  const mergeSchemas = formSchemas.utils.merge;

  const { preloadedNetwork } = {
    preloadedNetwork: null,
    ...options
  };

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

  const {
    id: agendaId,
    networkUid,
    formSchemaId
  } = agenda;

  const network = preloadedNetwork || await getNetwork(services, networkUid);

  const formSchema = await _loadFormSchema(formSchemas, agendaId, formSchemaId, !!_.get(network, 'formSchemaId'));

  const networkSchema = network ? await formSchemas.get(_.get(network, 'formSchemaId')) : null;

  // the network should come first.
  return mergeSchemas(networkSchema, formSchema);
}

function _loadFormSchema(formSchemas, agendaId, formSchemaId, hasNetworkSchema = false ) {
  if (formSchemaId) {
    return formSchemas.get(formSchemaId);
  }

  if (hasNetworkSchema) return null;

  return formSchemas.legacy.transfer(agendaId);
}
