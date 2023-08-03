import React from 'react';
import { IntlProvider } from 'react-intl';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';
import commonLocales from '@openagenda/common-labels';
import HistoryModal from '../../containers/HistoryModal/HistoryModal';
import appLocales from '../../../locales-compiled';

const locales = mergeLocales(appLocales, commonLocales);

export default function ActivitiesModal({ lang, trigger, res, modalTitle }) {
  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <HistoryModal trigger={trigger} res={res} modalTitle={modalTitle} />
    </IntlProvider>
  );
}
