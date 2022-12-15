'use strict';

const _ = require('lodash');

const eventFormSchema = require('@openagenda/event-form/src/schema');
const { createIntlByLocale } = require('@openagenda/intl');
const locales = require('@openagenda/agenda-schemas-app/dist/locales-compiled');
const getAgenda = require('../utils/getAgenda');
const getNetwork = require('../utils/getNetwork');

const intlByLocale = createIntlByLocale(locales);

module.exports = async function getSchema(services, agendaOrUid) {
  const {
    formSchemas,
  } = services;

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

  return agenda.formSchemaId ? {
    id: agenda.formSchemaId,
    ...await formSchemas.get(agenda.formSchemaId),
  } : null;
};

module.exports.network = async function getNetworkSchema(services, agendaOrUid) {
  const {
    formSchemas,
  } = services;

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);
  if (!agenda || !agenda.networkUid) {
    return null;
  }
  const network = await getNetwork(services, agenda.networkUid);

  return network.formSchemaId ? {
    id: network.formSchemaId,
    ...await formSchemas.get(network.formSchemaId),
  } : null;
};

module.exports.andParents = async function getSchemaAndParents(services, agendaOrUid, options) {
  const {
    formSchemas,
  } = services;

  const { lang = 'fr' } = options;

  const intl = intlByLocale[lang] || intlByLocale.fr;

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);
  const schema = agenda?.formSchemaId ? {
    id: agenda.formSchemaId,
    ...await formSchemas.get(agenda.formSchemaId),
  } : null;

  const network = await getNetwork(services, agenda.networkUid);
  const networkSchema = network?.formSchemaId ? {
    id: network.formSchemaId,
    ...await formSchemas.get(network.formSchemaId),
  } : null;

  const parents = [{
    schema: { fields: eventFormSchema().fields },
    info: {
      label: intl.formatMessage({ id: 'AgendaSchema.event' }),
      detail: intl.formatMessage({ id: 'AgendaSchema.eventDetail' }),
    },
  }];

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
  };
};
