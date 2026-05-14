import { wrapApp } from '@openagenda/react-shared';
import { useRef } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import { http, HttpResponse, delay } from 'msw';
import { HelmetProvider } from 'react-helmet-async';

import createApp from '../src/index.js';

import toulouseEmbed from './fixtures/toulouse.json' with { type: 'json' };
import apiAgendasToulouse from './fixtures/api.agendas.toulouse.get.json' with { type: 'json' };
import toulouseEvents from './fixtures/toulouse.events.json' with { type: 'json' };
import toulouseDefaultEmbed from './fixtures/toulouse.default.json' with { type: 'json' };

import AdminCanvas from './decorators/AdminCanvas.js';

export default {
  title: 'Integrated',
  decorators: [AdminCanvas],
};

export const IntegratedDefaultTemplates = {
  render: function Render() {
    const selectionMenuRef = useRef();
    return (
      <HelmetProvider>
        <div
          className="col-md-3 col-md-push-5 col-sm-12"
          ref={selectionMenuRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          {wrapApp(
            createApp({
              initialState: {
                apiRoot: '',
                prefix: '',
                res: {
                  events: '/agendas/:agendaUid/events',
                  embeds: '/agendas/:agendaUid/embeds',
                  agendaSettings: '/agendas/:agendaUid',
                  preview:
                    'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
                  previewScript:
                    'https://d.openagenda.com/js/embed/cibulBodyWidget.js',
                },
              },
            }),
            {
              disableScrollToTop: true,
              extraProps: {
                lang: 'fr',
                agenda: {
                  uid: 50522407,
                  slug: 'toulouse',
                  title: 'Métropole de Toulouse',
                },
                filtersContainerRef: selectionMenuRef,
              },
            },
          )}
        </div>
      </HelmetProvider>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/agendas/50522407', async () => {
          await delay(1000);
          return HttpResponse.json(apiAgendasToulouse);
        }),
        http.get('/agendas/50522407/embeds', async () => {
          await delay(1000);
          return HttpResponse.json([toulouseDefaultEmbed]);
        }),
        http.get('/agendas/50522407/events', async () => {
          await delay(1000);
          return HttpResponse.json(toulouseEvents);
        }),
        http.post('/agendas/50522407/embeds', async () => {
          await delay(1000);
          return new HttpResponse(null, { status: 200 });
        }),
      ],
    },
  },
};

export const IntegratedForUpdate = {
  render: function Render() {
    const selectionMenuRef = useRef();
    return (
      <HelmetProvider>
        <div
          className="col-md-3 col-md-push-5 col-sm-12"
          ref={selectionMenuRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          {wrapApp(
            createApp({
              initialState: {
                apiRoot: '',
                prefix: '',
                res: {
                  events: '/agendas/:agendaUid/events',
                  embeds: '/agendas/:agendaUid/embeds',
                  agendaSettings: '/agendas/:agendaUid',
                  preview:
                    'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
                  previewScript:
                    'https://d.openagenda.com/js/embed/cibulBodyWidget.js',
                },
              },
            }),
            {
              disableScrollToTop: true,
              extraProps: {
                lang: 'fr',
                agenda: {
                  uid: 50522407,
                  slug: 'toulouse',
                  title: 'Métropole de Toulouse',
                },
                filtersContainerRef: selectionMenuRef,
              },
            },
          )}
        </div>
      </HelmetProvider>
    );
  },
  parameters: {
    msw: {
      handlers: [
        http.get('/agendas/50522407', async () => {
          await delay(1000);
          return HttpResponse.json(apiAgendasToulouse);
        }),
        http.get('/agendas/50522407/embeds', async () => {
          await delay(1000);
          return HttpResponse.json([toulouseEmbed]);
        }),
        http.get('/agendas/50522407/events', async () => {
          await delay(1000);
          return HttpResponse.json(toulouseEvents);
        }),
        http.post('/agendas/50522407/embeds', async () => {
          await delay(1000);
          return new HttpResponse(null, { status: 200 });
        }),
      ],
    },
  },
};
