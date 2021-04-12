'use strict';

const _ = require('lodash');

const getAgenda = require('../utils/getAgenda');
const getNetwork = require('../utils/getNetwork');
const merge = require('../utils/merge');

const log = require('@openagenda/logs')('core/agendas/settings/getMergedSchema');

module.exports = async (services, agendaOrUid, options = {}) => {
  const {
    formSchemas
  } = services;

  const {
    preloadedNetwork,
    includeEvent,
    access
  } = {
    preloadedNetwork: null,
    includeEvent: false,
    access: 'public',
    ...options
  };

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

  const {
    id: agendaId,
    networkUid,
    formSchemaId
  } = agenda;

  const network = preloadedNetwork || await getNetwork(services, networkUid);

  const formSchema = await _loadFormSchema(
    formSchemas,
    agendaId,
    formSchemaId,
    !!_.get(network, 'formSchemaId')
  ).then(s => s ? ({ ...s, type: 'agenda' }) : s);

  const networkSchema = network ? await formSchemas
    .get(_.get(network, 'formSchemaId'))
    .then(s => s ? ({ ...s, type: 'network' }) : s) : null;

  if (includeEvent) {
    log('returning schema with event for access %s', access);
    return merge.schemasWithEvent(networkSchema, formSchema, access);
  }

  log('returning schema without event for access %s', access);
  return formSchemas.utils.merge(networkSchema, formSchema, { access });
}

async function _loadFormSchema(formSchemas, agendaId, formSchemaId, hasNetworkSchema = false ) {
  if (formSchemaId) {
    return formSchemas.get(formSchemaId);
  }

  if (hasNetworkSchema) return null;

  return formSchemas.legacy.transfer(agendaId);
}
