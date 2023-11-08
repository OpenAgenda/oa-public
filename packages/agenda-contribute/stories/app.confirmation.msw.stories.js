import { rest } from 'msw';
import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
import createApp from '../src';
import loadInitialState from './utils/loadInitialState';

import agenda from './fixtures/basic.detailed.agenda.json';
import agendaContributorContext from './fixtures/agendaContributor.context.json';
import { event } from './fixtures/event.json';

import '@openagenda/bs-templates/compiled/main.css';
import ProvidersDecorator from './decorators/Providers';

export default {
  title: 'App - Step 3: Confirmation (MSW)',
  decorators: [ProvidersDecorator],
}

export const ConfirmationWithPass = {
  render: (_args, { loaded: {} }) => {
    const initialState = {
      ...loadInitialState(),
      contribute: {
        createdEvent: {
          ...event,
          registration: [{
            type: 'link',
            value: 'https://link.pass.com',
            service: 'passCulture',
            data: {
              eventOffer: {
                id: 123,
              },
              errors: [{
                message: 'failed to create all dates',
                fieldLabel: 'Pass Culture',
                code: 'registration.pass.invalidDate.quantity',
                label: 'Certaines dates n\'ont pas pu être créées: les quantités saisies doivent être des entiers positifs',
              }]
            },
          }],
        },
      },
    };

    const history = createMemoryHistory({
      initialEntries: [`/${agenda.slug}/contribute/confirmation`]
    });

    return (
      <>
        <p className="text-center">Info regarding Pass Culture creation should appear</p>
        {wrapApp(
          createApp({
            initialState,
            history
          }),
          {
            extraProps: {
              lang: 'fr',
              agenda,
            },
          },
        )}
      </>
    )
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/me/agendas/56500817', (_req, res, ctx) => res(
          ctx.json(agendaContributorContext),
        )),
        rest.get('/api/agendas/56500817', (_req, res, ctx) => res(
          ctx.json(agenda),
        )),
      ],
    },
  },
}