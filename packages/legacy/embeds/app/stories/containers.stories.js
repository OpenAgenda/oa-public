import { useRef } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import { http, HttpResponse, delay } from 'msw';

import Dashboard from '../src/containers/Dashboard.js';

import AdminCanvas from './decorators/AdminCanvas.js';
import Providers from './decorators/Providers.js';

import toulouseEmbed from './fixtures/toulouse.json' with { type: 'json' };
import apiAgendasToulouse from './fixtures/api.agendas.toulouse.get.json' with { type: 'json' };
import toulouseEvents from './fixtures/toulouse.events.json' with { type: 'json' };

export default {
  title: 'Containers',
  decorators: [AdminCanvas, Providers],
};

const mswHandlers = {
  agenda: http.get('/agendas/50522407', async () => {
    await delay(1000);
    return HttpResponse.json(apiAgendasToulouse);
  }),
  getEmptyEmbed: http.get('/agendas/50522407/embeds', async () => {
    await delay(1000);
    return HttpResponse.json([]);
  }),
  getEmbed: http.get('/agendas/50522407/embeds', async () => {
    await delay(1000);
    return HttpResponse.json([toulouseEmbed]);
  }),
  PostEmbed: http.post('/agendas/50522407/embeds', async () => {
    await delay(1000);
    return HttpResponse.json(toulouseEmbed);
  }),
  postUpdatedEmbed: http.post('/agendas/50522407/embeds/80717033', async () => {
    await delay(1000);
    return new HttpResponse(null, { status: 200 });
  }),
  getEvents: http.get('/agendas/50522407/events', async () => {
    await delay(1000);
    return HttpResponse.json(toulouseEvents);
  }),
};

export const DashboardBeforeCreate = {
  render: function Render() {
    const selectionMenuRef = useRef();
    return (
      <>
        <div
          className="col-md-3 col-md-push-5 col-sm-12"
          ref={selectionMenuRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          <Dashboard
            selectionMenuContainerRef={selectionMenuRef}
            agendaSlug="toulouse-metropole"
            agendaUid={50522407}
            res={{
              embeds: '/agendas/:agendaUid/embeds',
              events: '/agendas/:agendaUid/events',
              agendaSettings: '/agendas/:agendaUid',
              preview:
                'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
              previewScript:
                'https://d.openagenda.com/js/embed/cibulBodyWidget.js',
            }}
          />
        </div>
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.agenda,
        mswHandlers.getEmptyEmbed,
        mswHandlers.getEvents,
        mswHandlers.postEmbed,
      ],
    },
  },
};

export const DashboardDefaultView = {
  render: function Render() {
    const selectionMenuRef = useRef();
    return (
      <>
        <div
          className="col-md-3 col-md-push-5 col-sm-12"
          ref={selectionMenuRef}
        />
        <div className="col-md-5 col-md-pull-3 col-sm-12 wsq padding-bottom-sm">
          <Dashboard
            selectionMenuContainerRef={selectionMenuRef}
            agendaSlug="toulouse-metropole"
            agendaUid={50522407}
            res={{
              events: '/agendas/:agendaUid/events',
              embeds: '/agendas/:agendaUid/embeds',
              agendaSettings: '/agendas/:agendaUid',
              preview:
                'https://d.openagenda.com/agendas/:agendaUid/previewEmbeds/:embedUid/events',
              previewScript:
                'https://d.openagenda.com/js/embed/cibulBodyWidget.js',
            }}
          />
        </div>
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.agenda,
        mswHandlers.getEmbed,
        mswHandlers.getEvents,
        mswHandlers.postUpdatedEmbed,
      ],
    },
  },
};
