import { wrapApp } from '@openagenda/react-shared';
import React, { useRef } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import { rest } from 'msw';
import { HelmetProvider } from 'react-helmet-async';

import createApp from '../src';

import toulouseEmbed from './fixtures/toulouse.json';
import apiAgendasToulouse from './fixtures/api.agendas.toulouse.get.json';
import toulouseEvents from './fixtures/toulouse.events.json';
import toulouseDefaultEmbed from './fixtures/toulouse.default.json';

import AdminCanvas from './decorators/AdminCanvas'

export default {
  title: 'Integrated',
  decorators: [AdminCanvas]
};


export const IntegratedDefaultTemplates = {
  render: () => {
    const selectionMenuRef = useRef();
    return (
      <HelmetProvider>
        <div className="col-md-3 col-md-push-5 col-sm-12" ref={selectionMenuRef} />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          {
            wrapApp(
              createApp({
                initialState: {
                  apiRoot: '',
                  prefix: '',
                  res: {
                    events: '/agendas/:agendaUid/events',
                    embeds: '/agendas/:agendaUid/embeds',
                    agendaSettings: '/agendas/:agendaUid',
                    preview: 'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
                    previewScript: 'https://d.openagenda.com/js/embed/cibulBodyWidget.js'
                  }
                }
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
                  filtersContainerRef: selectionMenuRef
                }
              }
            )
          }
        </div>
      </HelmetProvider>
    );
  }, parameters: {
    msw: {
      handlers: [
        rest.get('/agendas/50522407', async (_req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 1000));
          return res(ctx.status(200), ctx.json(apiAgendasToulouse))
        }),
        rest.get('/agendas/50522407/embeds', async (_req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 1000));
          return res(ctx.status(200), ctx.json([toulouseDefaultEmbed]))
        }),
        rest.get('/agendas/50522407/events', async (_req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 1000));
          return res(ctx.status(200), ctx.json(toulouseEvents))
        }),
        rest.post('/agendas/50522407/embeds', async (_req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 1000));
          return res(ctx.status(200))
        })
      ]
    }
  }
}

export const IntegratedForUpdate = {
  render: () => {
    const selectionMenuRef = useRef();
    return (
      <HelmetProvider>
        <div className="col-md-3 col-md-push-5 col-sm-12" ref={selectionMenuRef} />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          {
            wrapApp(
              createApp({
                initialState: {
                  apiRoot: '',
                  prefix: '',
                  res: {
                    events: '/agendas/:agendaUid/events',
                    embeds: '/agendas/:agendaUid/embeds',
                    agendaSettings: '/agendas/:agendaUid',
                    preview: 'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
                    previewScript: 'https://d.openagenda.com/js/embed/cibulBodyWidget.js'
                  }
                }
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
                  filtersContainerRef: selectionMenuRef
                }
              }
            )
          }
        </div>
      </HelmetProvider>
    );
  }, parameters: {
    msw: {
      handlers: [
        rest.get('/agendas/50522407', async (_req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 1000));
          return res(ctx.status(200), ctx.json(apiAgendasToulouse))
        }),
        rest.get('/agendas/50522407/embeds', async (_req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 1000));
          return res(ctx.status(200), ctx.json([toulouseEmbed]))
        }),
        rest.get('/agendas/50522407/events', async (_req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 1000));
          return res(ctx.status(200), ctx.json(toulouseEvents))
        }),
        rest.post('/agendas/50522407/embeds', async (_req, res, ctx) => {
          await new Promise(rs => setTimeout(rs, 1000));
          return res(ctx.status(200))
        })
      ]
    }
  }
}
