import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import ShareModal from '../src/components/ShareModal';
import Canvas from './decorators/Canvas';
import apiAgendas from './fixtures/api.agendas.get.json';
import noAgendas from './fixtures/api.noAgendas.get.json';

export default {
  title: 'Share',
  component: 'ShareModal',
  decorators: [Canvas],
};

const event = {
  agendaUid: 123456,
  uid: 456123,
  agendaTitle: 'Mon Agenda',
  agendaSlug: 'slug-de-mon-agenda',
  lang: 'fr',
};

const filterResults = searchText => {
  if (searchText === '') return apiAgendas;
  let total = 0;
  return {
    total,
    agendas: apiAgendas.agendas.filter(agenda => {
      if (
        agenda.description.toLowerCase().includes(searchText.toLowerCase()) ||
        agenda.title.toLowerCase().includes(searchText.toLowerCase())
      ) {
        total += 1;
        return agenda;
      }
      return false;
    }),
  };
};

const mockApi = () => {
  const mock = new MockAdapter(axios);
  mock.onGet('/agendas').reply(req => [200, req.params.search === '' ? apiAgendas : filterResults(req.params.search)]);
  mock.onGet('/noAgendas').reply(200, noAgendas);
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
};

export const ShareAll = () => {
  const [display, setDisplay] = useState(false);
  mockApi();
  return (
    <div className="ctas export__container">
      <button type="button" className="btn btn-default export__btn" onClick={() => setDisplay(true)}>
        Partager
      </button>
      {display && <ShareModal onClose={() => setDisplay(false)} res="/agendas" event={event} userLogged />}
    </div>
  );
};

export const ShareEmail = () => {
  const [display, setDisplay] = useState(false);

  mockApi();
  return (
    <div className="ctas export__container">
      <button type="button" className="btn btn-default export__btn" onClick={() => setDisplay(true)}>
        Partager par email
      </button>
      {display && <ShareModal onClose={() => setDisplay(false)} segment="email" event={event} userLogged />}
    </div>
  );
};

export const ShareOpenAgenda = () => {
  const [display, setDisplay] = useState(false);
  mockApi();
  return (
    <div className="ctas export__container">
      <button type="button" className="btn btn-default export__btn" onClick={() => setDisplay(true)}>
        Partager sur OpenAgenda
      </button>
      {display && <ShareModal onClose={() => setDisplay(false)} segment="openagenda" res="/agendas" event={event} userLogged />}
    </div>
  );
};

export const UserNotConnected = () => {
  const [display, setDisplay] = useState(false);
  mockApi();
  return (
    <div className="ctas export__container">
      <button type="button" className="btn btn-default export__btn" onClick={() => setDisplay(true)}>
        Partager
      </button>
      {display && <ShareModal onClose={() => setDisplay(false)} userLogged={false} event={event} />}
    </div>
  );
};
