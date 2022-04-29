import React, { useRef } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

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

export function DashboardBeforeCreate() {
  const mock = new MockAdapter(axios, {
    delayResponse: 1000
  });
  mock.onGet('/agendas/50522407').reply(200, apiAgendasToulouse);
  mock.onGet('/agendas/50522407/embeds').reply(200, []);
  mock.onPost('/agendas/50522407/embeds').reply(200, toulouseEmbed);
  mock.onGet('/agendas/50522407/events').reply(200, toulouseEvents);

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
}

export function DashboardDefaultView() {
  const mock = new MockAdapter(axios, {
    delayResponse: 1000
  });

  mock.onGet('/agendas/50522407').reply(200, apiAgendasToulouse);
  mock.onGet('/agendas/50522407/embeds').reply(200, [toulouseEmbed]);
  mock.onGet('/agendas/50522407/events').reply(200, toulouseEvents);
  mock.onPost('/agendas/50522407/embeds/80717033').reply(200);

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
}
