import eventFormSchema from '@openagenda/event-form/schema';
import { createIntlByLocale } from '@openagenda/intl';
import * as locales from '@openagenda/agenda-schemas-app/locales-compiled';
import eventReservedFields from '../agendas/settings/eventReservedFields.js';

const intlByLocale = createIntlByLocale(locales);

export default async (core, networkUid, options = {}) => {
  const { formSchemas } = core.services;
  const { lang = 'fr' } = options;

  const intl = intlByLocale[lang] || intlByLocale.fr;

  const network = await core.networks(networkUid).get();

  if (!network) {
    throw new Error('Network not found');
  }

  const schema = network.formSchemaId
    ? {
      id: network.formSchemaId,
      ...await formSchemas.get(network.formSchemaId),
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

  return {
    schema,
    parents,
    reservedFields: eventReservedFields,
  };
};
