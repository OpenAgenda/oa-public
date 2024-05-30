import React, { useRef } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import { rest } from 'msw'

import Dashboard from '../src/containers/Dashboard';

import AdminCanvas from './decorators/AdminCanvas';
import Providers from './decorators/Providers';

import toulouseEmbed from './fixtures/toulouse.json';
import apiAgendasToulouse from './fixtures/api.agendas.toulouse.get.json';
import toulouseEvents from './fixtures/toulouse.events.json';

export default {
  title: 'Containers',
  decorators: [AdminCanvas, Providers]
};

const mswHandlers = {
  agenda: rest.get('/agendas/50522407', async (_req, res, ctx) => {
    await new Promise(rs => setTimeout(rs, 1000));
    return res(ctx.status(200), ctx.json(apiAgendasToulouse));
  }),
  getEmptyEmbed: rest.get('/agendas/50522407/embeds', async (_req, res, ctx) => {
    await new Promise(rs => setTimeout(rs, 1000));
    return res(ctx.status(200), ctx.json([]));
  }),
  getEmbed: rest.get('/agendas/50522407/embeds', async (_req, res, ctx) => {
    await new Promise(rs => setTimeout(rs, 1000));
    return res(ctx.status(200), ctx.json([toulouseEmbed]));
  }),
  PostEmbed: rest.post('/agendas/50522407/embeds', async (_req, res, ctx) => {
    await new Promise(rs => setTimeout(rs, 1000));
    return res(ctx.status(200), ctx.json(toulouseEmbed));
  }),
  postUpdatedEmbed: rest.post('/agendas/50522407/embeds/80717033', async (_req, res, ctx) => {
    await new Promise(rs => setTimeout(rs, 1000));
    return res(ctx.status(200));
  }),
  getEvents: rest.get('/agendas/50522407/events', async (_req, res, ctx) => {
    await new Promise(rs => setTimeout(rs, 1000));
    return res(ctx.status(200), ctx.json(toulouseEvents));
  })
}


export const DashboardBeforeCreate = {
  render: () => {
    const selectionMenuRef = useRef();
    return (
      <>
        <div className="col-md-3 col-md-push-5 col-sm-12" ref={selectionMenuRef} />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          <Dashboard
            selectionMenuContainerRef={selectionMenuRef}
            agendaUid={50522407}
            res={{
              embeds: '/agendas/:agendaUid/embeds',
              events: '/agendas/:agendaUid/events',
              agendaSettings: '/agendas/:agendaUid',
              preview: 'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
              previewScript: 'https://d.openagenda.com/js/embed/cibulBodyWidget.js'
            }}
          />
        </div>
      </>
    );
  }, parameters: {
    msw: {
      handlers: [
        mswHandlers.agenda,
        mswHandlers.getEmptyEmbed,
        mswHandlers.getEvents,
        mswHandlers.postEmbed,
      ]
    }
  }
}

export const DashboardDefaultView = {
  render: () => {
    const selectionMenuRef = useRef();
    return (
      <>
        <div className="col-md-3 col-md-push-5 col-sm-12" ref={selectionMenuRef} />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          <Dashboard
            selectionMenuContainerRef={selectionMenuRef}
            agendaUid={50522407}
            res={{
              events: '/agendas/:agendaUid/events',
              embeds: '/agendas/:agendaUid/embeds',
              agendaSettings: '/agendas/:agendaUid',
              preview: 'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
              previewScript: 'https://d.openagenda.com/js/embed/cibulBodyWidget.js'
            }}
          />
        </div>
      </>
    );
  }, parameters: {
    msw: {
      handlers: [
        mswHandlers.agenda,
        mswHandlers.getEmbed,
        mswHandlers.getEvents,
        mswHandlers.postUpdatedEmbed,
      ]
    }
  }
}