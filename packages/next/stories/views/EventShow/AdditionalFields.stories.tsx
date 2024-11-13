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
          'categories-metropolitaines': [17, 16],
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

export const TrueBooleanField = () => {
  const dateFnsLocale = useDateFnsLocale();

  return (
    <AdditionalFields
      updatedAt={new Date()}
      agenda={agendaFixtures}
      additionalFields={formatAdditionalFieldData({
        schema: {
          fields: [
            {
              field: 'trueBooleanField',
              label: {
                fr: 'Champs booleen à true',
                en: 'True boolean field',
              },
              fieldType: 'boolean',
            },
          ],
        },
        event: {
          trueBooleanField: true,
        },
        locale: 'fr',
        defaultLocale: 'fr',
        dateFnsLocale,
      })}
    />
  );
};

export const FalseBooleanField = () => {
  const dateFnsLocale = useDateFnsLocale();

  return (
    <AdditionalFields
      updatedAt={new Date()}
      agenda={agendaFixtures}
      additionalFields={formatAdditionalFieldData({
        schema: {
          fields: [
            {
              field: 'falseBooleanField',
              label: {
                fr: 'Champs booleen à false',
                en: 'False boolean field',
              },
              fieldType: 'boolean',
            },
          ],
        },
        event: {
          falseBooleanField: false,
        },
        locale: 'fr',
        defaultLocale: 'fr',
        dateFnsLocale,
      })}
    />
  );
};

export const UndefinedBooleanField = () => {
  const dateFnsLocale = useDateFnsLocale();

  return (
    <AdditionalFields
      updatedAt={new Date()}
      agenda={agendaFixtures}
      additionalFields={formatAdditionalFieldData({
        schema: {
          fields: [
            {
              field: 'undefinedBooleanField',
              label: {
                fr: 'Champs booleen à undefined',
                en: 'Undefined boolean field',
              },
              fieldType: 'boolean',
            },
          ],
        },
        event: {
          undefinedBooleanField: undefined,
        },
        locale: 'fr',
        defaultLocale: 'fr',
        dateFnsLocale,
      })}
    />
  );
};

export const PDFField = () => {
  const dateFnsLocale = useDateFnsLocale();

  return (
    <AdditionalFields
      updatedAt={new Date()}
      agenda={agendaFixtures}
      additionalFields={formatAdditionalFieldData({
        schema: {
          fields: [
            {
              field: 'PDFField',
              label: {
                fr: 'Champs PDF',
                en: 'PDF field',
              },
              fieldType: 'file',
              store: {
                type: 's3',
                bucket: 'cibul',
              },
            },
          ],
        },
        event: {
          PDFField: {
            originalName: 'document.pdf',
            extension: 'pdf',
            filename:
              '7d521a91961a4251bb820849a8637b84.charger-ici-le-document-emis-par-la-commission-consultative-departementale-de-securite-et-daccessibilite.pdf',
          },
        },
        locale: 'fr',
        defaultLocale: 'fr',
        dateFnsLocale,
      })}
    />
  );
};

export const ImageField = () => {
  const dateFnsLocale = useDateFnsLocale();

  return (
    <AdditionalFields
      updatedAt={new Date()}
      agenda={agendaFixtures}
      additionalFields={formatAdditionalFieldData({
        schema: {
          fields: [
            {
              field: 'imageField',
              label: {
                fr: 'Champs image',
                en: 'Image field',
              },
              fieldType: 'image',
              store: {
                type: 's3',
                bucket: 'cibul',
              },
            },
          ],
        },
        event: {
          imageField: {
            originalName: 'image.jpg',
            extension: 'jpg',
            filename:
              '81cd0a6919894516b2a5b235eea44c06.photographie-dune-salle-de-classe.jpg',
          },
        },
        locale: 'fr',
        defaultLocale: 'fr',
        dateFnsLocale,
      })}
    />
  );
};
