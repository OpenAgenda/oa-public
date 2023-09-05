import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import { Modal } from '@openagenda/react-shared';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import AgendaSearchInput from '../src/components/AgendaSearchInput';

import SimplePage from './decorators/SimplePage';
import homeAgendas from './fixtures/api.homeAgendas.json';
import publicAgendas from './fixtures/api.publicAgendas.json';

export default {
  title: 'Components',
  decorators: [SimplePage]
};

export const DefaultAgendaSearchInputWithoutPrefetch = () => {
  const mock = new MockAdapter(axios);

  mock.onGet('/agendas').reply(() => [200, homeAgendas]);

  return (
    <>
      <p>Search input is presented, agendas are loaded on search.</p>
      <AgendaSearchInput
        getTitleLink={agenda => `/#${agenda.slug}`}
        res="/agendas"
        targetAgenda={{ title: 'Un agenda', slug: 'un-agenda' }}
      />
    </>
  );
};

export const DefaultAgendaSearchInputWithPrefetch = () => {
  const mock = new MockAdapter(axios);

  mock.onGet('/agendas').reply(() => [200, homeAgendas]);

  return (
    <>
      <p>Search input is presented, agendas are loaded on search.</p>
      <AgendaSearchInput
        getTitleLink={agenda => `/#${agenda.slug}`}
        res="/agendas"
        targetAgenda={{ title: 'Un agenda', slug: 'un-agenda' }}
        preFetchAgendas
      />
    </>
  );
};

export const DefaultAgendaSearchInputInModal = () => {
  const mock = new MockAdapter(axios);

  mock.onGet('/agendas').reply(() => [200, homeAgendas]);

  return (
    <div id="event">
      <Modal classNames={{ overlay: 'popup-overlay big' }}>
        <AgendaSearchInput
          getTitleLink={agenda => `/#${agenda.slug}`}
          res="/agendas"
          targetAgenda={{ title: 'Un agenda', slug: 'un-agenda' }}
          preFetchAgendas
        />
      </Modal>
    </div>
  );
};

function filterResults(query, response) {
  const {
    search,
    page = 1
  } = query;

  const matches = response.agendas
    .filter(a => (search?.length ? a.title.indexOf(search) !== -1 : a));

  const startIndex = (page - 1) * 10;

  return {
    ...response,
    agendas: matches.slice(startIndex, startIndex + 10),
    total: matches.length
  };
}

export const AgendaSearchInputWithMultipleSources = () => {
  const mock = new MockAdapter(axios);

  mock.onGet('/agendas').reply(req => [200, filterResults(req.params, homeAgendas)]);
  mock.onGet('/publicAgendas').reply(req => [200, filterResults(req.params, publicAgendas)]);

  return (
    <div id="event">
      <Modal classNames={{ overlay: 'popup-overlay big' }}>
        <AgendaSearchInput
          getTitleLink={agenda => `/#${agenda.slug}`}
          res={['/agendas', 'publicAgendas']}
          targetAgenda={{
            title: 'Un agenda',
            slug: 'un-agenda'
          }}
          preFetchAgendas
          perPageLimit={10}
        />
      </Modal>
    </div>
  );
};

export const AgendaSearchInputWithEmptyFirstSource = () => {
  const mock = new MockAdapter(axios);

  const fewHomeAgendas = homeAgendas.agendas.slice(0, 3);

  mock.onGet('/agendas').reply(req => [200, filterResults(req.params, {
    ...homeAgendas,
    total: fewHomeAgendas.length,
    agendas: fewHomeAgendas
  })]);
  mock.onGet('/publicAgendas').reply(req => [200, filterResults(req.params, publicAgendas)]);

  return (
    <div id="event">
      <Modal classNames={{ overlay: 'popup-overlay big' }}>
        <AgendaSearchInput
          getTitleLink={agenda => `/#${agenda.slug}`}
          res={['/agendas', 'publicAgendas']}
          targetAgenda={{
            title: 'Un agenda',
            slug: 'un-agenda'
          }}
          preFetchAgendas
          perPageLimit={10}
        />
      </Modal>
    </div>
  );
};
