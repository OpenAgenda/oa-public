import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import ExportModal from '../src/components/ExportModal';
import Canvas from './decorators/Canvas';

export default {
  title: 'Export',
  component: 'ExportModal',
  decorators: [Canvas],
};

const me = '/api/me';

const urls = {
  jsonV2: 'https://localhost:9001/v2/agendas/1234/events',
  jsonV1: '/events.json',
  pdf: '/',
  xl: '/',
  gcal: '/',
  ical: '/',
  csv: '/',
  ics: '/',
  rss: '/',
};

const mockApi = () => {
  const mock = new MockAdapter(axios, {
    delayResponse: 1000,
  });
  mock.onGet('/api/me').reply(200, { apiKey: 123456 });
};

export const ExportLoggedIn = () => {
  mockApi();
  const [display, setDisplay] = useState(false);
  const [languageQuery, setLanguageQuery] = useState('');

  const handleExportLanguage = format => {
    if (format === 'csv' || format === 'xl') {
      return `&cols.lang=${languageQuery}`;
    }
    return '';
  };

  const formatExportLinks = res => {
    const newUrls = Object.keys(res).reduce(
      (url, key) => ({
        ...url,
        [key]: urls[key] + handleExportLanguage(key),
      }),
      {}
    );
    return newUrls;
  };

  const handleQuery = lang => {
    setLanguageQuery(lang);
    return languageQuery;
  };

  return (
    <div className="ctas export-container">
      <button className="btn btn-default export-btn" type="button" onClick={() => setDisplay(true)}>
        <i className="fa fa-external-link" />
        <span>&nbsp; Exporter</span>
      </button>
      {display ? (
        <ExportModal
          exportLanguage={(lang, format) => handleQuery(lang, format)}
          onClose={() => setDisplay(false)}
          res={{ export: formatExportLinks(urls), me }}
          languages={['fr', 'de', 'en', 'es', 'it', 'nl']}
          userLogged
        />
      ) : null}
    </div>
  );
};

export const ExportLoggedOut = () => {
  const [display, setDisplay] = useState(false);
  const [languageQuery, setLanguageQuery] = useState('');

  const handleExportLanguage = format => {
    if (format === 'csv' || format === 'xl') {
      return `&cols.lang=${languageQuery}`;
    }
    return '';
  };

  const formatExportLinks = res => {
    const newUrls = Object.keys(res).reduce(
      (url, key) => ({
        ...url,
        [key]: urls[key] + handleExportLanguage(key),
      }),
      {}
    );
    return newUrls;
  };

  const handleQuery = lang => {
    setLanguageQuery(lang);
    return languageQuery;
  };

  return (
    <div className="ctas export-container">
      <button className="btn btn-default export-btn" type="button" onClick={() => setDisplay(true)}>
        <i className="fa fa-external-link" />
        <span>&nbsp; Exporter</span>
      </button>
      {display ? (
        <ExportModal
          exportLanguage={(lang, format) => handleQuery(lang, format)}
          onClose={() => setDisplay(false)}
          res={{ export: formatExportLinks(urls), me }}
          languages={['fr', 'de', 'en', 'es', 'it', 'nl']}
          userLogged={false}
          root="http://localhost:9001"
        />
      ) : null}
    </div>
  );
};
