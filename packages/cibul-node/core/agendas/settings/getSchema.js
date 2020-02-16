'use strict';

const _ = require('lodash');

const getAgenda = require('../utils/getAgenda');
const getNetwork = require('../utils/getNetwork');

module.exports = async (services, agendaOrUid) => {
  const {
    formSchemas
  } = services;

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

  return agenda.formSchemaId ? Object.assign({ id: agenda.formSchemaId }, await formSchemas.get(agenda.formSchemaId)) : null;
}

module.exports.network = async (services, agendaOrUid) => {
  const {
    formSchemas
  } = services;

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);
  if (!agenda || !agenda.networkUid) {
    return null;
  }
  const network = await getNetwork(services, agenda.networkUid);

  return network.formSchemaId ? Object.assign({
    id: network.formSchemaId
  }, await formSchemas.get(network.formSchemaId)) : null;
}
