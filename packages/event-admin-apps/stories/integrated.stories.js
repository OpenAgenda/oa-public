import { http, HttpResponse } from 'msw';
import { useRef } from 'react';
import { createMemoryHistory } from 'history';
import { wrapApp } from '@openagenda/react-shared';

import createApp from '../src/app.js';
import AdminPageDecorator from './decorators/AdminPage.js';
import ProvidersDecorator from './decorators/Providers.js';

import '@openagenda/bs-templates/compiled/main.css';
import mainData from './fixtures/new.json';
import exportSettings from './fixtures/exportSettings.json';

const getDefaultState = () => ({
  settings: {
    prefix: '',
    perPageLimit: 20,
    mapTiles: '',
    assetsPath: 'https://cdn.openagenda.com/assets/',
  },
  res: {
    jsonExport: '/:slug/events.json',
    search: '/:slug/events/search',
  },
});

export default {
  title: 'Integrated',
};

export const Presentation = {
  render: function Render() {
    const filtersContainerRef = useRef();

    return (
      <>
        <div
          className="col-md-3 col-md-push-5 col-sm-12 wsq filters"
          ref={filtersContainerRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          {wrapApp(
            createApp({
              history: createMemoryHistory(),
              initialState: getDefaultState({}),
            }),
            {
              disableScrollToTop: true,
              extraProps: {
                agendaSchema: {
                  fields: [],
                },
                lang: 'fr',
                agenda: {
                  uid: 48959239,
                  slug: 'la-gargouille',
                  title: 'La gargouille',
                  credentials: {
                    aggregator: true,
                  },
                },
                filtersContainerRef,
              },
            },
          )}
        </div>
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.post('/la-gargouille/events/search', () =>
          HttpResponse.json(mainData)),
        http.get('/agendas/48959239/admin/settings/exports', () =>
          HttpResponse.json(exportSettings)),
        http.post(
          '/:agendaSlug/events/:eventSlug/state',
          async ({ request, params }) => {
            const event = JSON.parse(
              JSON.stringify(
                mainData.events.find((e) => e.slug === params.eventSlug),
              ),
            );
            return HttpResponse.json({ ...event, ...await request.json() });
          },
        ),
      ],
    },
  },
  decorators: [AdminPageDecorator, ProvidersDecorator],
};

export const WithSelectionOfFilters = {
  render: function Render() {
    const filtersContainerRef = useRef();

    return (
      <>
        <div
          className="col-md-3 col-md-push-5 col-sm-12 wsq filters"
          ref={filtersContainerRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          {wrapApp(
            createApp({
              history: createMemoryHistory(),
              initialState: getDefaultState({}),
            }),
            {
              disableScrollToTop: true,
              extraProps: {
                agendaSchema: {
                  fields: [],
                },
                lang: 'fr',
                agenda: {
                  uid: 48959239,
                  slug: 'la-gargouille',
                  title: 'La gargouille',
                  credentials: {
                    aggregator: true,
                  },
                  settings: {
                    admin: {
                      filters: {
                        displayed: ['search', 'keyword', 'geo', 'state'],
                      },
                    },
                  },
                },
                filtersContainerRef,
              },
            },
          )}
        </div>
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.post('/la-gargouille/events/search', () =>
          HttpResponse.json(mainData)),
        http.get('/agendas/48959239/admin/settings/exports', () =>
          HttpResponse.json(exportSettings)),
        http.post(
          '/:agendaSlug/events/:eventSlug/state',
          async ({ request, params }) => {
            const event = JSON.parse(
              JSON.stringify(
                mainData.events.find((e) => e.slug === params.eventSlug),
              ),
            );
            return HttpResponse.json({ ...event, ...await request.json() });
          },
        ),
      ],
    },
  },
  decorators: [AdminPageDecorator, ProvidersDecorator],
};
