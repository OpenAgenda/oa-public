import { http, HttpResponse } from 'msw';
import qs from 'qs';
import { Container } from '@openagenda/uikit';
import EventShow from 'views/EventShow';
import useDateFnsLocale from 'hooks/useDateFnsLocale';

import AdditionalFields from 'views/EventShow/components/AdditionalFields';
import { formatAdditionalFieldData } from 'views/EventShow/utils/additionalFields';

import intlMessagesLoader from '../../loaders/intlMessagesLoader';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';

import agendaFixtures from '../../fixtures/mel.agenda.json';
import eventsFixtures from '../../fixtures/mel.events.json';

export default {
  title: 'views/EventShow/AdditionalFields',
  component: AdditionalFields,
  loaders: [intlMessagesLoader(EventShow.fetchLocale)],
  decorators: [
    (Story) => (
      <Container maxW="md" bg="white" p="5" my="5">
        <Story />
      </Container>
    ),
    ProvidersDecorator,
  ],
};

export const OptionedField = () => {
  const dateFnsLocale = useDateFnsLocale();

  return (
    <AdditionalFields
      updatedAt={new Date()}
      agenda={agendaFixtures}
      additionalFields={formatAdditionalFieldData({
        schema: {
          fields: [
            {
              field: 'categories-metropolitaines',
              label: {
                fr: 'Catégories Métropolitaines',
                en: 'Catégories Métropolitaines',
              },
              options: [
                {
                  id: 16,
                  value: 'mode',
                  label: { fr: 'Mode' },
                },
                {
                  id: 17,
                  value: 'musique',
                  label: { fr: 'Musique' },
                },
                {
                  id: 18,
                  value: 'reunion-publique',
                  label: { fr: 'Réunion publique' },
                },
              ],
              fieldType: 'checkbox',
            },
          ],
        },
        event: {
          'categories-metropolitaines': 17,
        },
        locale: 'fr',
        defaultLocale: 'fr',
        dateFnsLocale,
      })}
    />
  );
};

export const OptionedFieldMissingOption = () => {
  const dateFnsLocale = useDateFnsLocale();

  return (
    <AdditionalFields
      updatedAt={new Date()}
      agenda={agendaFixtures}
      additionalFields={formatAdditionalFieldData({
        schema: {
          fields: [
            {
              field: 'categories-metropolitaines',
              label: {
                fr: 'Catégories Métropolitaines',
                en: 'Catégories Métropolitaines',
              },
              options: [
                {
                  id: 16,
                  value: 'mode',
                  label: { fr: 'Mode' },
                },
                {
                  id: 17,
                  value: 'musique',
                  label: { fr: 'Musique' },
                },
                {
                  id: 18,
                  value: 'reunion-publique',
                  label: { fr: 'Réunion publique' },
                },
              ],
              fieldType: 'checkbox',
            },
          ],
        },
        event: {
          'categories-metropolitaines': [17, 19],
        },
        locale: 'fr',
        defaultLocale: 'fr',
        dateFnsLocale,
      })}
    />
  );
};

export const EventsField = {
  render: function EventsFieldStoryComponent() {
    const dateFnsLocale = useDateFnsLocale();

    return (
      <AdditionalFields
        updatedAt={new Date()}
        agenda={agendaFixtures}
        additionalFields={formatAdditionalFieldData({
          schema: {
            fields: [
              {
                field: 'subEvents',
                label: {
                  fr: 'Événements enfants',
                  en: 'Sub-events',
                },
                fieldType: 'events',
              },
            ],
          },
          event: {
            subEvents: [18422197, 82947971, 73418354],
          },
          locale: 'fr',
          defaultLocale: 'fr',
          dateFnsLocale,
        })}
      />
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`/api/agendas/${agendaFixtures.uid}/events`, ({ request }) => {
          const url = new URL(request.url);
          const { uid } = qs.parse(url.search.replace('?', ''));
          const selection = eventsFixtures.events.filter((event) =>
            [].concat(uid).includes(`${event.uid}`));

          return HttpResponse.json({
            total: selection.length,
            events: selection,
          });
        }),
      ],
    },
  },
};

export const EmptyEventsField = () => {
  const dateFnsLocale = useDateFnsLocale();

  return (
    <AdditionalFields
      updatedAt={new Date()}
      agenda={agendaFixtures}
      additionalFields={formatAdditionalFieldData({
        schema: {
          fields: [
            {
              field: 'subEvents',
              label: {
                fr: 'Événements enfants',
                en: 'Sub-events',
              },
              fieldType: 'events',
            },
          ],
        },
        event: {
          subEvents: [],
        },
        locale: 'fr',
        defaultLocale: 'fr',
        dateFnsLocale,
      })}
    />
  );
};
