import _ from 'lodash';
import { rest } from 'msw';
import qs from 'qs';

import { wrapApp } from '@openagenda/react-shared';
import { createMemoryHistory } from 'history';
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

const mswHandlers = {
  getContributorAgendaContext: rest.get(
    '/api/me/agendas/56500817',
    (_req, res, ctx) => res(ctx.json(agendaContributorContext)),
  ),
  getContributorEventContext: rest.get(
    '/api/me/agendas/56500817/events/20231103',
    (_req, res, ctx) => res(ctx.json(eventContributorContext)),
  ),
  getAgendaDetails: rest.get(
    '/api/agendas/56500817',
    (_req, res, ctx) => res(ctx.json(agenda)),
  ),
  searchAgendaLocations: rest.get(
    '/api/agendas/56500817/locations',
    (req, res, ctx) => res(
      ctx.json(qs.parse(req.url.search, { ignoreQueryPrefix: true }).itemsKey === 'items' ? {
        ..._.omit(locationsAPIResponse, 'locations'),
        items: locationsAPIResponse.locations,
      } : locationsAPIResponse),
    ),
  ),
  getLocationDetail: rest.get(
    '/locations/27156847.json',
    (_req, res, ctx) => res(
      ctx.json(locationsAPIResponse.locations.find(l => l.uid === 27156847)),
    ),
  ),
  getEventDetails: rest.get(
    '/api/agendas/56500817/events/20231103',
    (_req, res, ctx) => res(
      ctx.json({
        event: {
          title: { fr: 'Un titre' },
          description: { fr: 'Une description courte' },
          timings: [{
            begin: { date: '2023-11-03', hours: '12', minutes: '08' },
            end: { date: '2023-11-03', hours: '14', minutes: '13' },
          }],
          location: { uid: 27156847 },
        },
      }),
    ),
  ),
};

export const EditConfirmation = {
  render: () => {
    const initialState = loadInitialState();

    const history = createMemoryHistory({
      initialEntries: [`/${agenda.slug}/contribute/event/20231103`],
    });

    return (
      <>
        <p className="text-center">Submit form to see confirmation screen displayed before redirect. Happens when a pass offer has been created.</p>
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
        rest.post('/ile-de-france/contribute/event/20231103', (_req, res, ctx) => res(
          ctx.status(200),
          ctx.json({
            success: true,
            event: {
              uid: 123,
              registration: [{
                type: 'link',
                value: 'https://link.pass.com',
                service: 'passCulture',
                data: {
                  id: 123,
                },
              }],
            },
          }),
        )),
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
        <p className="text-center">Submit form to see server validation errors appear on bottom of form. The server responds with the following payload:</p>
        <pre>
          <code>
            {JSON.stringify({
              success: false,
              errors: [{
                message: 'failed to create pass offer',
                code: 'registration.pass',
                field: 'registration',
                fieldLabel: 'Pass Culture',
                label: 'Il y a eu une erreur lors de la création de l\'offre Pass',
              }],
              event: null,
            }, null, 2)}
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
            event: null,
          }),
        )),
      ],
    },
  },
};
