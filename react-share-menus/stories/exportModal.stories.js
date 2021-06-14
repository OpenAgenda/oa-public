import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import ExportModal from '../src/components/ExportModal';

export default {
  title: 'Export',
  component: 'ExportModal',
};

export const Export = () => (
  <ExportModal
    res={[
      { format: 'json', url: 'testurl.com' },
      { format: 'pdf', url: 'testurl.com' },
      { format: 'xl', url: 'testurl.com' },
      { format: 'gcal', url: 'testurl.com' },
      { format: 'ical', url: 'testurl.com' },
      { format: 'csv', url: 'testurl.com' },
      { format: 'ics', url: 'testurl.com' },
      { format: 'rss', url: 'testurl.com' },
    ]}
    languages={[
      { label: 'français', value: 'fr' },
      { label: 'anglais', value: 'en' },
      { label: 'espagnol', value: 'es' },
      { label: 'allemand', value: 'd' },
    ]}
  />
);
