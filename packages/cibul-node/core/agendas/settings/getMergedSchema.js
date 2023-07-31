'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('core/agendas/settings/getMergedSchema');
const memberLabels = require('@openagenda/labels/members');

const getAgenda = require('../utils/getAgenda');
const getNetwork = require('../utils/getNetwork');
const merge = require('../utils/merge');
const getMemberSchema = require('../utils/getMemberSchema');

async function loadFormSchema(formSchemas, agendaId, formSchemaId) {
  if (formSchemaId) {
    return formSchemas.get(formSchemaId);
  }

  return null;
}

module.exports = async (services, agendaOrUid, options = {}) => {
  const {
    formSchemas,
  } = services;

  const {
    preloadedNetwork = null,
    includeEvent = false,
    includeMember = false,
    includeMemberSchema = false,
    includeNonDataFields = false,
    includeDateRange = false,
    includeAgendaEvent = false,
    includeOriginAgenda = false,
    includeLocationLegacyAdminLevels = true,
    access = 'public',
    actingMember,
  } = options;

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

  const {
    id: agendaId,
    networkUid,
    formSchemaId,
  } = agenda;

  const network = preloadedNetwork || await getNetwork(services, networkUid);

  const formSchema = await loadFormSchema(
    formSchemas,
    agendaId,
    formSchemaId,
    !!_.get(network, 'formSchemaId'),
  ).then(s => (s ? { ...s, type: 'agenda' } : s));

  const networkSchema = network ? await formSchemas
    .get(_.get(network, 'formSchemaId'))
    .then(s => (s ? { ...s, type: 'network' } : s)) : null;

  const mergeArgs = [networkSchema, formSchema];

  if (includeMember || includeMemberSchema) {
    const memberField = {
      field: 'member',
      read: ['administrator', 'moderator', 'internal'],
      label: memberLabels.member,
      fieldType: 'abstract',
    };

    if (includeMemberSchema) {
      memberField.schema = (
        await getMemberSchema(services, agenda, { access, actingMember })
      ).merged;
    }

    mergeArgs.push({
      fields: [memberField],
    });
  }

  if (includeDateRange) {
    mergeArgs.push({
      fields: [{
        field: 'dateRange',
        fieldType: 'text',
      }],
    });
  }

  if (includeAgendaEvent) {
    mergeArgs.push({
      fields: [{
        field: 'state',
        fieldType: 'abstract',
      }, {
        field: 'featured',
        fieldType: 'abstract',
      }],
    });
  }

  if (includeOriginAgenda) {
    mergeArgs.push({
      fields: [{
        field: 'originAgenda',
        fieldType: 'abstract',
      }],
    });
  }

  const mergeOptions = {
    includeLocationLegacyAdminLevels,
  };

  if (includeEvent) {
    log('returning schema with event for access %s', access);
    return merge.schemasWithEvent(...mergeArgs, {
      ...mergeOptions,
      access,
      includeNonDataFields,
    });
  }

  log('returning schema without event for access %s', access);

  if (access?.read !== 'internal') {
    mergeOptions.access = access;
  }

  return merge.schemas(...mergeArgs, mergeOptions);
};
