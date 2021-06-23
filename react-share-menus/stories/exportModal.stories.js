import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import ExportModal from '../src/components/ExportModal';
import Canvas from './decorators/Canvas';

export default {
  title: 'Export',
  component: 'ExportModal',
  decorators: [Canvas],
};

export const Export = () => {
  const [display, setDisplay] = useState(false);
  const [languageQuery, setLanguageQuery] = useState('');

  const urls = {
    json: '/',
    pdf: '/',
    xl: '/',
    gcal: '/',
    ical: '/',
    csv: '/',
    ics: '/',
    rss: '/',
  };

  /* const closeModal = () => {
    setDisplay(false);
  }; */

  const handleExportLanguage = format => {
    return format === 'csv' || format === 'xl'
      ? `&cols.lang=${languageQuery}`
      : '';
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
    <>
      <button
        className="js_export_button btn btn-link"
        type="button"
        onClick={() => setDisplay(true)}
      >
        <i className="fa fa-external-link" />
        <span>&nbsp; Exporter la sélection</span>
      </button>
      {display ? (
        <ExportModal
          exportLanguage={(lang, format) => handleQuery(lang, format)}
          onClose={() => setDisplay(false)}
          res={formatExportLinks(urls)}
          languages={['fr', 'de', 'en', 'es', 'it', 'nl']}
        />
      ) : null}
    </>
  );
};
