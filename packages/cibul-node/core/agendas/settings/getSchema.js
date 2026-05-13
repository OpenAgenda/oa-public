import _ from 'lodash';
import eventFormSchema from '@openagenda/event-form/schema';
import { createIntlByLocale } from '@openagenda/intl';
import * as locales from '@openagenda/agenda-schemas-app/locales-compiled';
import getAgenda from '../utils/getAgenda.js';
import getNetwork from '../utils/getNetwork.js';
import eventReservedFields from './eventReservedFields.js';

const intlByLocale = createIntlByLocale(locales);

export default async function getSchema(services, agendaOrUid) {
  const { formSchemas } = services;

  const agenda = _.isObject(agendaOrUid)
    ? agendaOrUid
    : await getAgenda(services, agendaOrUid);

  return agenda.formSchemaId
    ? {
      id: agenda.formSchemaId,
      ...await formSchemas.get(agenda.formSchemaId),
    }
    : null;
}

export const network = async function getNetworkSchema(services, agendaOrUid) {
  const { formSchemas } = services;

  const agenda = _.isObject(agendaOrUid)
    ? agendaOrUid
    : await getAgenda(services, agendaOrUid);
  if (!agenda || !agenda.networkUid) {
    return null;
  }
  const dbNetwork = await getNetwork(services, agenda.networkUid);

  return dbNetwork.formSchemaId
    ? {
      id: dbNetwork.formSchemaId,
      ...await formSchemas.get(dbNetwork.formSchemaId),
    }
    : null;
};

export const andParents = async function getSchemaAndParents(
  services,
  agendaOrUid,
  options,
) {
  const { formSchemas } = services;

  const { lang = 'fr' } = options;

  const intl = intlByLocale[lang] || intlByLocale.fr;

  const agenda = _.isObject(agendaOrUid)
    ? agendaOrUid
    : await getAgenda(services, agendaOrUid);
  const schema = agenda?.formSchemaId
    ? {
      id: agenda.formSchemaId,
      ...await formSchemas.get(agenda.formSchemaId),
    }
    : null;

  const dbNetwork = await getNetwork(services, agenda.networkUid);
  const networkSchema = dbNetwork?.formSchemaId
    ? {
      id: dbNetwork.formSchemaId,
      ...await formSchemas.get(dbNetwork.formSchemaId),
    }
    : null;

  const parents = [
    {
      schema: { fields: eventFormSchema().fields, id: -1 },
      info: {
        label: intl.formatMessage({ id: 'AgendaSchema.event' }),
        detail: intl.formatMessage({ id: 'AgendaSchema.eventDetail' }),
      },
    },
  ];

  if (networkSchema) {
    parents.push({
      schema: networkSchema,
      info: {
        label: intl.formatMessage({ id: 'AgendaSchema.network' }),
        detail: intl.formatMessage({ id: 'AgendaSchema.networkDetail' }),
      },
    });
  }

  return {
    schema,
    parents,
    reservedFields: eventReservedFields,
  };
};
