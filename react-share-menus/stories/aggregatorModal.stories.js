import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import AggregatorModal from '../src/components/AggregatorModal';
import apiAgendas from './fixtures/api.agendas.get.json';
import noAgendas from './fixtures/api.noAgendas.get.json';
import Canvas from './decorators/Canvas';

export default {
  title: 'Aggregator',
  component: 'AggregatorModal',
  decorators: [Canvas],
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

const mockApi = () => {
  const mock = new MockAdapter(axios, {
    delayResponse: 1000,
  });
  mock.onGet('/agendas').reply(req => [200, req.params.search === '' ? apiAgendas : filterResults(req.params.search)]);
  mock.onGet('/noAgendas').reply(200, noAgendas);
};

const whiteLogo = 'https://oastatic.s3.eu-central-1.amazonaws.com/whitelogo22.png';
const blueLogo = 'https://oastatic.s3.eu-central-1.amazonaws.com/openagenda-blue-22.png';

export const Aggregator = () => {
  const [display, setDisplay] = useState(false);
  const [logo, setLogo] = useState(whiteLogo);

  mockApi();
  return (
    <div className="ctas export-container">
      <button
        className="btn btn-default export-btn"
        type="button"
        onClick={() => setDisplay(true)}
        onMouseOver={() => setLogo(blueLogo)}
        onMouseOut={() => setLogo(whiteLogo)}
        onFocus={() => setLogo(blueLogo)}
        onBlur={() => setLogo(whiteLogo)}
      >
        <img alt="logo" src={logo} />
        &nbsp; Agréger
      </button>
      {display ? (
        <AggregatorModal
          onClose={() => setDisplay(false)}
          targetAgenda={{ title: "L'agenda de la Gargouille", slug: 'notre-agenda' }}
          res="/agendas"
          userLogged
        />
      ) : null}
    </div>
  );
};

export const AggregatorSuccess = () => {
  const [display, setDisplay] = useState(true);
  const [success] = useState(true);
  const [logo, setLogo] = useState(whiteLogo);
  mockApi();
  return (
    <div className="ctas export-container">
      <button
        className="btn btn-default export-btn"
        type="button"
        onClick={() => setDisplay(true)}
        onMouseOver={() => setLogo(blueLogo)}
        onMouseOut={() => setLogo(whiteLogo)}
        onFocus={() => setLogo(blueLogo)}
        onBlur={() => setLogo(whiteLogo)}
      >
        <img alt="logo" src={logo} />
        &nbsp; Agréger
      </button>
      {display ? (
        <AggregatorModal
          onClose={() => setDisplay(false)}
          targetAgenda={{ title: "L'agenda de la Gargouille", slug: 'notre-agenda' }}
          res="/agendas"
          success={success}
          userLogged
        />
      ) : null}
    </div>
  );
};

export const NoAgendas = () => {
  const [display, setDisplay] = useState(false);
  const [logo, setLogo] = useState(whiteLogo);
  mockApi();
  return (
    <div className="ctas export-container">
      <button
        className="btn btn-default export-btn"
        type="button"
        onClick={() => setDisplay(true)}
        onMouseOver={() => setLogo(blueLogo)}
        onMouseOut={() => setLogo(whiteLogo)}
        onFocus={() => setLogo(blueLogo)}
        onBlur={() => setLogo(whiteLogo)}
      >
        <img alt="logo" src={logo} />
        &nbsp; Agréger
      </button>
      {display ? (
        <AggregatorModal
          onClose={() => setDisplay(false)}
          targetAgenda={{ title: "L'agenda de la Gargouille", slug: 'notre-agenda' }}
          res="/noAgendas"
          userLogged
        />
      ) : null}
    </div>
  );
};

export const NotLoggedIn = () => {
  const [display, setDisplay] = useState(false);
  const [logo, setLogo] = useState(whiteLogo);
  mockApi();
  return (
    <div className="ctas export-container">
      <button
        className="btn btn-default export-btn"
        type="button"
        onClick={() => setDisplay(true)}
        onMouseOver={() => setLogo(blueLogo)}
        onMouseOut={() => setLogo(whiteLogo)}
        onFocus={() => setLogo(blueLogo)}
        onBlur={() => setLogo(whiteLogo)}
      >
        <img alt="logo" src={logo} />
        &nbsp; Agréger
      </button>
      {display ? (
        <AggregatorModal
          onClose={() => setDisplay(false)}
          targetAgenda={{ title: "L'agenda de la Gargouille", slug: 'notre-agenda' }}
          res="/agendas"
          userLogged={false}
        />
      ) : null}
    </div>
  );
};
