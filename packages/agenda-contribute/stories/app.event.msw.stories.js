import { rest } from 'msw';
import qs from 'qs';

import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
import { produce } from 'immer';
import createApp from '../src';
import loadInitialState from './utils/loadInitialState';
import agenda from './fixtures/basic.detailed.agenda.json';
import agendaContributorContext from './fixtures/agendaContributor.context.json';
import eventContributorContext from './fixtures/contributor.context.json';
import locationsAPIResponse from './fixtures/locations.json';

import '@openagenda/bs-templates/compiled/main.css';

import ProvidersDecorator from './decorators/Providers';

export default {
  title: 'App - Step 2: Event (MSW)',
  decorators: [ProvidersDecorator],
};

export const ServerValidationErrors = {
  render: (_args, { loaded: {} }) => {
    const initialState = loadInitialState();

    const history = createMemoryHistory({
      initialEntries: [`/${agenda.slug}/contribute/event/20231103`]
    });

    return (
      <>
        <p className="text-center">Submit form to see server validation errors appear on bottom of form. The server responds with the following payload:</p>
        <pre><code>{JSON.stringify({
          success: false,
          errors: [{
            message: 'failed to create pass offer',
            code: 'registration.pass',
            field: 'registration',
            fieldLabel: 'Pass Culture',
            label: 'Il y a eu une erreur lors de la création de l\'offre Pass',
          }],
          event: null
        }, null, 2)}
        </code></pre>
        {wrapApp(
          createApp({
            initialState,
            history,
          }),
          {
            extraProps: {
              lang: 'fr',
              agenda,
            }
          }
        )}
      </>
    ); 

  },
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/me/agendas/56500817', (_req, res, ctx) => res(
          ctx.json(agendaContributorContext),
        )),
        rest.get('/api/me/agendas/56500817/events/20231103', (_req, res, ctx) => res(
          ctx.json(eventContributorContext),
        )),
        rest.get('/api/agendas/56500817', (_req, res, ctx) => res(
          ctx.json(agenda),
        )),
        rest.get('/api/agendas/56500817/locations', (req, res, ctx) => res(
          ctx.json(qs.parse(req.url.search, { ignoreQueryPrefix: true }).itemsKey === 'items' ? {
            ..._.omit(locationsAPIResponse, 'locations'),
            items: locationsAPIResponse.locations,
          } : locationsAPIResponse),
        )),
        rest.get('/locations/27156847.json', (_req, res, ctx) => res(
          ctx.json(locationsAPIResponse.locations.find(l => l.uid === 27156847)),
        )),
        rest.get('/api/agendas/56500817/events/20231103', (req, res, ctx) => res(
          ctx.json({
            event: {
              title: { fr: 'Un événement qui va planter à la sauvegarde' },
              description: { fr: 'Le serveur va renvoyer une erreur de validation' },
              timings: [{
                begin: { date: '2023-11-03', hours: '12', minutes: '08' },
                end: { date: '2023-11-03', hours: '14', minutes: '13' },
              }],
              location: { uid: 27156847 },
            }
          }),
        )),
        rest.post('/ile-de-france/contribute/event/20231103', (_req, res, ctx) => res(
          ctx.status(400),
          ctx.json({
            success: false,
            errors: [{
              message: 'failed to create pass offer',
              code: 'registration.pass',
              field: 'registration',
              fieldLabel: 'Pass Culture',
              label: 'Il y a eu une erreur lors de la création de l\'offre Pass',
            }],
            event: null
          }),
        )),
      ],
    },
  },
}

