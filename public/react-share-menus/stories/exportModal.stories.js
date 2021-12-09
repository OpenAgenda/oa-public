import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import ExportModal from '../src/components/export-modal/ExportModal';
import Canvas from './decorators/Canvas';
import columns from './fixtures/columns.json';

export default {
  title: 'Export',
  component: 'ExportModal',
  decorators: [Canvas],
};

const urls = {
  jsonV2: 'https://localhost:9001/v2/agendas/1234/events',
  jsonV1: '/events.json',
  pdf: '/',
  xlsx: 'https://localhost:9001/agendas/1234/events.v2.xlsx',
  gcal: '/',
  ical: '/',
  csv: 'https://localhost:9001/agendas/1234/events.v2.csv',
  ics: '/',
  rss: '/',
};

const mockApi = () => {
  const mock = new MockAdapter(axios, {
    delayResponse: 1000,
  });
  mock.onGet('/api/me').reply(200, { apiKey: 123456 });
  mock.onGet('/columns').reply(200, columns);
};

export const ExportLoggedIn = () => {
  mockApi();
  const [display, setDisplay] = useState(true);

  return (
    <div className="ctas export-container">
      <button className="btn btn-default export-btn" type="button" onClick={() => setDisplay(true)}>
        <i className="fa fa-external-link" />
        <span>&nbsp; Exporter</span>
      </button>
      {display ? (
        <ExportModal
          onClose={() => setDisplay(false)}
          res={{ export: urls, me: '/api/me', agendaExportSettings: '/columns' }}
          languages={['fr', 'de', 'en', 'es', 'it', 'nl']}
          userLogged
        />
      ) : null}
    </div>
  );
};

export const ExportLoggedOut = () => {
  const [display, setDisplay] = useState(false);

  return (
    <div className="ctas export-container">
      <button className="btn btn-default export-btn" type="button" onClick={() => setDisplay(true)}>
        <i className="fa fa-external-link" />
        <span>&nbsp; Exporter</span>
      </button>
      {display ? (
        <ExportModal
          onClose={() => setDisplay(false)}
          res={{ export: urls, me: '/api/me', agendaExportSettings: '/columns' }}
          languages={['fr', 'de', 'en', 'es', 'it', 'nl']}
          userLogged={false}
          root="http://localhost:9001"
        />
      ) : null}
    </div>
  );
};
