'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('core/agendas/settings/getMergedSchema');

const getAgenda = require('../utils/getAgenda');
const getNetwork = require('../utils/getNetwork');
const merge = require('../utils/merge');

async function loadFormSchema(formSchemas, agendaId, formSchemaId, hasNetworkSchema = false) {
  if (formSchemaId) {
    return formSchemas.get(formSchemaId);
  }

  if (hasNetworkSchema) return null;

  return formSchemas.legacy.transfer(agendaId);
}

module.exports = async (services, agendaOrUid, options = {}) => {
  const {
    formSchemas
  } = services;

  const {
    preloadedNetwork = null,
    includeEvent = false,
    includeMember = false,
    includeNonDataFields = false,
    includeAgendaEvent = false,
    access = 'public'
  } = options;

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

  const {
    id: agendaId,
    networkUid,
    formSchemaId
  } = agenda;

  const network = preloadedNetwork || await getNetwork(services, networkUid);

  const formSchema = await loadFormSchema(
    formSchemas,
    agendaId,
    formSchemaId,
    !!_.get(network, 'formSchemaId')
  ).then(s => (s ? ({ ...s, type: 'agenda' }) : s));

  const networkSchema = network ? await formSchemas
    .get(_.get(network, 'formSchemaId'))
    .then(s => (s ? ({ ...s, type: 'network' }) : s)) : null;

  const mergeArgs = [networkSchema, formSchema];

  if (includeMember) {
    mergeArgs.push({
      fields: [{
        field: 'member',
        read: ['administrator', 'moderator', 'internal'],
        fieldType: 'abstract'
      }]
    });
  }

  if (includeAgendaEvent) {
    mergeArgs.push({
      fields: [{
        field: 'state',
        fieldType: 'abstract'
      }, {
        field: 'featured',
        fieldType: 'abstract'
      }]
    });
  }

  if (includeEvent) {
    mergeArgs.push({
      access,
      includeNonDataFields
    });

    log('returning schema with event for access %s', access);
    return merge.schemasWithEvent.apply(null, mergeArgs);
  }

  log('returning schema without event for access %s', access);
  mergeArgs.push(access?.read === 'internal' ? null : { access });

  return formSchemas.utils.merge.apply(null, mergeArgs);
};
