import React from 'react';
import { IntlProvider } from 'react-intl';
import { getSupportedLocale } from '@openagenda/intl';
import HistoryModal from '../../containers/HistoryModal/HistoryModal';
import locales from '../../../locales-compiled';

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
