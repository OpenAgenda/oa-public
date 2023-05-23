import React from 'react';
import { IntlProvider } from 'react-intl';
import { getSupportedLocale } from '@openagenda/intl';
import LocationApp from '../../containers/LocationApp/LocationApp';
import locales from '../../../locales-compiled';

export default function LocationActivities({ lang, agendaUid, locationUid, link }) {
  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <LocationApp agendaUid={agendaUid} locationUid={locationUid} link={link} />
    </IntlProvider>
  );
}
