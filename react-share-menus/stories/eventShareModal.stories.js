import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import EventShareModal from '../src/components/EventShareModal';
import Canvas from './decorators/Canvas';
import apiAgendas from './fixtures/api.agendas.get.json';
import singleDate from './fixtures/api.singleDate.get.json';

export default {
  title: 'Share',
  component: 'EventShareModal',
  decorators: [Canvas],
};

const event = {
  agendaUid: 123456,
  uid: 456123,
  agendaTitle: 'Mon Agenda',
  agendaSlug: 'slug-de-mon-agenda',
  lang: 'fr',
  root: 'localhost:9001'
};

const filterResults = searchText => {
  if (searchText === '') return apiAgendas;
  let total = 0;
  return {
    total,
    agendas: apiAgendas.agendas.filter(agenda => {
      if (
        agenda.description.toLowerCase().includes(searchText.toLowerCase()) || agenda.title.toLowerCase().includes(searchText.toLowerCase())
      ) {
        total += 1;
        return agenda;
      }
      return false;
    }),
  };
};

export const ShareAll = () => {
  const [display, setDisplay] = useState(true);

  const mock = new MockAdapter(axios);

  mock.onGet('/agendas').reply(req => [200, req.params.search === '' ? apiAgendas : filterResults(req.params.search)]);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=google`)
    .reply(200, apiAgendas);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=yahoo`)
    .reply(200, apiAgendas);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=live`)
    .reply(200, apiAgendas);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=ics`)
    .reply(200, apiAgendas);

  return (
    <div className="ctas export-container">
      <button type="button" className="btn btn-default export-btn" onClick={() => setDisplay(true)}>
        Partager
      </button>
      {display && <EventShareModal onClose={() => setDisplay(false)} res="/agendas" event={event} userLogged />}
    </div>
  );
};

export const OneDate = () => {
  const [display, setDisplay] = useState(true);
  const mock = new MockAdapter(axios);
  mock.onGet('/agendas').reply(req => [200, req.params.search === '' ? apiAgendas : filterResults(req.params.search)]);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=google`)
    .reply(200, singleDate);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=yahoo`)
    .reply(200, singleDate);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=live`)
    .reply(200, singleDate);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=ics`)
    .reply(200, singleDate);

  return (
    <div className="ctas export-container">
      <button type="button" className="btn btn-default export-btn" onClick={() => setDisplay(true)}>
        Partager
      </button>
      {display && <EventShareModal onClose={() => setDisplay(false)} res="/agendas" event={event} userLogged />}
    </div>
  );
};

export const ShareEmail = () => {
  const [display, setDisplay] = useState(false);

  return (
    <div className="ctas export-container">
      <button type="button" className="btn btn-default export-btn" onClick={() => setDisplay(true)}>
        Partager par email
      </button>
      {display && <EventShareModal onClose={() => setDisplay(false)} segment="email" event={event} userLogged />}
    </div>
  );
};

export const ShareOpenAgenda = () => {
  const [display, setDisplay] = useState(false);

  const mock = new MockAdapter(axios);
  mock.onGet('/agendas').reply(req => [200, req.params.search === '' ? apiAgendas : filterResults(req.params.search)]);

  return (
    <div className="ctas export-container">
      <button type="button" className="btn btn-default export-btn" onClick={() => setDisplay(true)}>
        Partager sur OpenAgenda
      </button>
      {display && (
        <EventShareModal onClose={() => setDisplay(false)} segment="openagenda" res="/agendas" event={event} userLogged />
      )}
    </div>
  );
};

export const UserNotConnected = () => {
  const [display, setDisplay] = useState(false);

  const mock = new MockAdapter(axios);

  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=google`)
    .reply(200, apiAgendas);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=yahoo`)
    .reply(200, apiAgendas);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=live`)
    .reply(200, apiAgendas);
  mock
    .onGet(`/${event.agendaSlug}/events/${event.uid}/action/dates?lang=${event.lang}&service=ics`)
    .reply(200, apiAgendas);

  return (
    <div className="ctas export-container">
      <button type="button" className="btn btn-default export-btn" onClick={() => setDisplay(true)}>
        Partager
      </button>
      {display && <EventShareModal onClose={() => setDisplay(false)} userLogged={false} event={event} />}
    </div>
  );
};
