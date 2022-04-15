import React, { useState } from 'react';
import axios from 'axios';
import MockAdapter from '@openagenda/axios-mock-adapter';
import { IntlProvider } from 'react-intl';

import { modalLocales } from '@openagenda/react-share-menus';
import { mergeLocales } from '@openagenda/intl';
import SpreadsheetModal from '../src/components/SpreadsheetModal';
import appLocales from '../src/locales-compiled';
import SimplePageDecorator from './decorators/SimplePage';
import ProvidersDecorator from './decorators/Providers';
import exportSettings from './fixtures/exportSettings.json';
import '@openagenda/bs-templates/compiled/main.css';

const locales = mergeLocales(appLocales, modalLocales);

export default {
  title: 'Spreadsheet export options',
  decorators: [SimplePageDecorator, ProvidersDecorator],
};

const mock = new MockAdapter(axios, {
  delayResponse: 1000,
});

mock.onGet('/agendas/123456/admin/settings/exports').reply(200, exportSettings);

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
