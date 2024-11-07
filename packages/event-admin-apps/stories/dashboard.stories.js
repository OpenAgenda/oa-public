import { http, HttpResponse } from 'msw';

import { useState } from 'react';
import { IntlProvider } from 'react-intl';

import { modalLocales } from '@openagenda/react-share-menus';
import { mergeLocales } from '@openagenda/intl';
import SpreadsheetModal from '../src/components/SpreadsheetModal.js';
import * as appLocales from '../src/locales-compiled/index.mjs';
import SimplePageDecorator from './decorators/SimplePage.js';
import ProvidersDecorator from './decorators/Providers.js';
import exportSettings from './fixtures/exportSettings.json';
import '@openagenda/bs-templates/compiled/main.css';

const locales = mergeLocales(appLocales, modalLocales);

export default {
  title: 'Spreadsheet export options',
  decorators: [SimplePageDecorator, ProvidersDecorator],
};

export const OpenModal = () => {
  const [, setDisplay] = useState(true);
  return (
    <IntlProvider messages={locales.fr} locale="fr" key="fr">
      <SpreadsheetModal
        onClose={() => setDisplay(false)}
        agendaUid="123456"
        queryString="?relative[]=passed"
      />
    </IntlProvider>
  );
};

OpenModal.parameters = {
  msw: {
    handlers: [
      http.get('/agendas/123456/admin/settings/exports', () =>
        HttpResponse.json(exportSettings)),
    ],
  },
};
