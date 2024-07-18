import _ from 'lodash';
import logs from '@openagenda/logs';
import memberLabels from '@openagenda/labels/members/index.js';
import getAgenda from '../utils/getAgenda.mjs';
import getNetwork from '../utils/getNetwork.mjs';
import * as merge from '../utils/merge.mjs';
import getMemberSchema from '../utils/getMemberSchema.mjs';

const log = logs('core/agendas/settings/getMergedSchema');

async function loadFormSchema(formSchemas, formSchemaId) {
  if (formSchemaId) {
    return formSchemas.get(formSchemaId);
  }

  return null;
}

function dispatchSettingsInFields(services, agenda, schema) {
  const {
    registrations,
  } = services;

  for (const field of schema.fields) {
    if (field.fieldType === 'events') {
      field.res = `/api/agendas/${agenda.uid}/events`;
      continue;
    }

    if (field.field === 'registration' && agenda.settings?.registration?.passCulture) {
      field.settings = {
        ...agenda.settings.registration,
        passCulture: {
          ...agenda.settings.registration.passCulture,
          res: {
            context: `/api/me/agendas/${agenda.uid}`,
            settings: `/api/agendas/${agenda.uid}/settings/passCulture`,
            offerLink: registrations?.settings.passCulture.offerLink,
            offerEditLink: registrations?.settings.passCulture.offerEditLink,
          },
        },
      };
      continue;
    }
  }

  return schema;
}

export default async (services, agendaOrUid, options = {}) => {
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
    networkUid,
    formSchemaId,
  } = agenda;

  const network = preloadedNetwork || await getNetwork(services, networkUid);

  const formSchema = await loadFormSchema(
    formSchemas,
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
    return dispatchSettingsInFields(services, agenda, merge.schemasWithEvent(...mergeArgs, {
      ...mergeOptions,
      access,
      includeNonDataFields,
    }));
  }

  log('returning schema without event for access %s', access);

  if (access?.read !== 'internal') {
    mergeOptions.access = access;
  }

  return dispatchSettingsInFields(services, agenda, merge.schemas(...mergeArgs, mergeOptions));
};
