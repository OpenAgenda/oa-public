import '@openagenda/bs-templates/compiled/main.css';

import _ from 'lodash';
import qs from 'qs';
import { http, HttpResponse } from 'msw';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/index.js';
import componentFromFixtures from './utils/componentFromFixtures.js';
import ProvidersDecorator from './decorators/Providers.js';
import agendaContributorContext from './fixtures/agendaContributor.context.json' with { type: 'json' };
import eventContributorContext from './fixtures/contributor.context.json' with { type: 'json' };
import agenda from './fixtures/basic.detailed.agenda.json' with { type: 'json' };
import locationsAPIResponse from './fixtures/locations.json' with { type: 'json' };
import loadInitialState from './utils/loadInitialState.js';

export default {
  title: 'App - Step 2: Event',
  decorators: [ProvidersDecorator],
};

const mswHandlers = {
  getContributorAgendaContext: http.get('/api/me/agendas/56500817', () =>
    HttpResponse.json(agendaContributorContext)),
  getContributorEventContext: http.get(
    '/api/me/agendas/56500817/events/20231103',
    () => HttpResponse.json(eventContributorContext),
  ),
  getAgendaDetails: http.get('/api/agendas/56500817', () =>
    HttpResponse.json(agenda)),
  searchAgendaLocations: http.get(
    '/api/agendas/56500817/locations',
    ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json(
        qs.parse(url.search, { ignoreQueryPrefix: true }).itemsKey === 'items'
          ? {
            ..._.omit(locationsAPIResponse, 'locations'),
            items: locationsAPIResponse.locations,
          }
          : locationsAPIResponse,
      );
    },
  ),
  getLocationDetail: http.get('/locations/27156847.json', () =>
    HttpResponse.json(
      locationsAPIResponse.locations.find((l) => l.uid === 27156847),
    )),
  getEventDetails: http.get('/api/agendas/56500817/events/20231103', () =>
    HttpResponse.json({
      event: {
        title: { fr: 'Un titre' },
        description: { fr: 'Une description courte' },
        timings: [
          {
            begin: { date: '2023-11-03', hours: '12', minutes: '08' },
            end: { date: '2023-11-03', hours: '14', minutes: '13' },
          },
        ],
        location: { uid: 27156847 },
      },
    })),
};

/**
 * match with fixtures is made using agenda uid (second argument of componentFromFixtures)
 */

export const NewEventForm = componentFromFixtures(
  `Contributor is shown standard event form for entering a new event.
  Location search presents location list.`,
  100,
);

export const EditEventForm = componentFromFixtures(
  'Contributor is shown standard event form for editing an event. State change select is not available.',
  101,
  '/event/01',
);

export const NewEventFormWithDefaults = componentFromFixtures(
  'Contributor is shown event form with default values loaded through URL',
  102,

  qs.stringify(
    {
      defaults: {
        event: {
          title: {
            fr: 'Un titre par défaut',
          },
        },
      },
    },
    { addQueryPrefix: true },
  ),
);

export const NewEventFormWithTwoLanguageTabsOpened = componentFromFixtures(
  'Contributor is shown event form with two language tabs opened',
  103,
);

export const EventCreateLeadsToCompletionStep = componentFromFixtures(
  'When event is created, contributor goes to completing step',
  103,

  qs.stringify(
    {
      defaults: {
        event: {
          title: {
            fr: 'Un titre par défaut',
          },
          description: {
            fr: 'Une description par défaut',
          },
          location: {
            uid: 28723185,
          },
          timings: [
            {
              begin: {
                date: '2022-06-17',
                hours: 13,
                minutes: 30,
              },
              end: {
                date: '2022-06-17',
                hours: 17,
                minutes: 30,
              },
            },
          ],
        },
      },
    },
    { addQueryPrefix: true },
  ),
);

export const EditDraftEventForm = componentFromFixtures(
  'Edited draft event is shown in steppered layout',
  104,

  '/event/02/draft',
);

export const EditDraftEventFormFromEditRoute = componentFromFixtures(
  'Draft event loaded from non draft route is redirected to draft route',
  105,

  '/event/03',
);

export const AdminEditEventForm = componentFromFixtures(
  'Administrator is shown standard event form for editing an event. State change select is available.',
  106,

  '/event/01',
);

export const EditEventFormByAdminWithoutEditRights = componentFromFixtures(
  'Component informing member that event edition is not permitted is shown above form',
  107,

  '/event/01',
);

export const EventCreateByDuplication = componentFromFixtures(
  'Event is create using data taken from another event',
  108,

  '?agendaUid=109&eventUid=21832558',
);

export const Event502 = componentFromFixtures(
  'Server returns a 502 error when the contributor attempts a save. The app should not crash and invite the user to resubmit after a short while',
  110,
  '/event/01',
);

export const EditConfirmation = {
  render: () => {
    const initialState = loadInitialState();

    const history = createMemoryHistory({
      initialEntries: [`/${agenda.slug}/contribute/event/20231103`],
    });

    return (
      <>
        <p className="text-center">
          Submit form to see confirmation screen displayed before redirect.
          Happens when a pass offer has been created.
        </p>
        {wrapApp(
          createApp({
            initialState,
            history,
          }),
          {
            extraProps: {
              lang: 'fr',
              agenda,
            },
          },
        )}
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.getContributorAgendaContext,
        mswHandlers.getContributorEventContext,
        mswHandlers.getAgendaDetails,
        mswHandlers.searchAgendaLocations,
        mswHandlers.getLocationDetail,
        mswHandlers.getEventDetails,
        http.post('/ile-de-france/contribute/event/20231103', () =>
          HttpResponse.json({
            success: true,
            event: {
              uid: 123,
              registration: [
                {
                  type: 'link',
                  value: 'https://link.pass.com',
                  service: 'passCulture',
                  data: {
                    id: 123,
                  },
                },
              ],
            },
          })),
      ],
    },
  },
};

export const ServerValidationErrors = {
  render: () => {
    const initialState = loadInitialState();

    const history = createMemoryHistory({
      initialEntries: [`/${agenda.slug}/contribute/event/20231103`],
    });

    return (
      <>
        <p className="text-center">
          Submit form to see server validation errors appear on bottom of form.
          The server responds with the following payload:
        </p>
        <pre>
          <code>
            {JSON.stringify(
              {
                success: false,
                errors: [
                  {
                    message: 'failed to create pass offer',
                    code: 'registration.pass',
                    field: 'registration',
                    fieldLabel: 'Pass Culture',
                    label:
                      "Il y a eu une erreur lors de la création de l'offre Pass",
                  },
                ],
                event: null,
              },
              null,
              2,
            )}
          </code>
        </pre>
        {wrapApp(
          createApp({
            initialState,
            history,
          }),
          {
            extraProps: {
              lang: 'fr',
              agenda,
            },
          },
        )}
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.getContributorAgendaContext,
        mswHandlers.getContributorEventContext,
        mswHandlers.getAgendaDetails,
        mswHandlers.searchAgendaLocations,
        mswHandlers.getLocationDetail,
        mswHandlers.getEventDetails,
        http.post('/ile-de-france/contribute/event/20231103', () =>
          HttpResponse.json({
            success: false,
            errors: [
              {
                message: 'failed to create pass offer',
                code: 'registration.pass',
                field: 'registration',
                fieldLabel: 'Pass Culture',
                label:
                  "Il y a eu une erreur lors de la création de l'offre Pass",
              },
            ],
            event: null,
          })),
      ],
    },
  },
};
