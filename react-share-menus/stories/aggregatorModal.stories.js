import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import AggregatorModal from '../src/components/AggregatorModal';
import apiAgendas from './fixtures/api.agendas.get.json';
import Canvas from './decorators/Canvas';

export default {
  title: 'Aggregator',
  component: 'AggregatorModal',
  decorators: [Canvas],
};

const filterResults = searchText => {
  if (searchText === '') return apiAgendas;
  return {
    total: 53,
    agendas: apiAgendas.agendas.filter(agenda => {
      if (
        agenda.description.toLowerCase().includes(searchText.toLowerCase())
        || agenda.title.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return agenda;
      }
      return false;
    })
  };
};

const mockApi = () => {
  const mock = new MockAdapter(axios, {
    delayResponse: 1000,
  });
  mock.onGet('/agendas').reply(req => [200, req.params.searchText === '' ? apiAgendas : filterResults(req.params.searchText)]);
};

export const Aggregator = () => {
  const [display, setDisplay] = useState(false);
  mockApi();
  return (
    <>
      <button className="btn btn-primary" type="button" onClick={() => setDisplay(true)}>
        <img alt="logo" src="https://oastatic.s3.eu-central-1.amazonaws.com/whitelogo22.png" />
        <span>&nbsp; Agréger</span>
      </button>
      {display ? (
        <AggregatorModal
          onClose={() => setDisplay(false)}
          targetAgenda={{ title: 'Ville de Lille', slug: 'ville-de-lille' }}
          res="/agendas"
        />
      ) : null}
    </>
  );
};
