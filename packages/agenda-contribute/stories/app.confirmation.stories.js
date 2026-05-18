import '@openagenda/bs-templates/compiled/main.css';

import { createMemoryHistory } from 'history';
import { http, HttpResponse } from 'msw';
import { wrapApp } from '@openagenda/react-shared';
import createApp from '../src/index.js';
import componentFromFixtures from './utils/componentFromFixtures.js';
import ProvidersDecorator from './decorators/Providers.js';
import loadInitialState from './utils/loadInitialState.js';
import agenda from './fixtures/basic.detailed.agenda.json' with { type: 'json' };
import { event } from './fixtures/event.json' with { type: 'json' };
import agendaContributorContext from './fixtures/agendaContributor.context.json' with { type: 'json' };

export default {
  title: 'App - Step 3: Confirmation',
  decorators: [ProvidersDecorator],
};

export const BasicConfirmation = componentFromFixtures(
  'Contributor saved his event, is shown default completion screen',
  200,
  '/confirmation',
);

export const CustomMessageConfirmation = componentFromFixtures(
  'Contributor saved his event, is show completion screen with custom message',
  201,
  '/confirmation',
);

export const ConfirmationRedirect = componentFromFixtures(
  'Direct access to confirmation screen at load takes user back to previous step',
  202,
  '/confirmation',
);

export const ConfirmationWithPass = {
  render: () => {
    const initialState = {
      ...loadInitialState(),
      contribute: {
        createdEvent: {
          ...event,
          registration: [
            {
              type: 'link',
              value: 'https://link.pass.com',
              service: 'passCulture',
              data: {
                eventOffer: {
                  id: 123,
                },
                errors: [
                  {
                    message: 'failed to create all dates',
                    fieldLabel: 'Pass Culture',
                    code: 'registration.pass.invalidDate.quantity',
                    label:
                      "Certaines dates n'ont pas pu être créées: les quantités saisies doivent être des entiers positifs",
                  },
                ],
              },
            },
          ],
        },
      },
    };

    const history = createMemoryHistory({
      initialEntries: [`/${agenda.slug}/contribute/confirmation`],
    });

    return (
      <>
        <p className="text-center">
          Info regarding Pass Culture creation should appear
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
        http.get('/api/me/agendas/56500817', () =>
          HttpResponse.json(agendaContributorContext)),
        http.get('/api/agendas/56500817', () => HttpResponse.json(agenda)),
      ],
    },
  },
};
