import React from 'react';
import { IntlProvider } from 'react-intl';
import labels from '@openagenda/labels/activities/event';
import { getSupportedLocale } from '@openagenda/intl';
import { ActivityItem } from '../../components';
import locales from '../../../locales-compiled';

import 'moment/locale/fr';


export default function ( options ) {

  const { lang, activities } = Object.assign( {
    activities: [],
    lang: 'fr'
  }, options );

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div>
        {(activities && activities.length > 0) && <ul className="list-unstyled activity-list">
          {activities.map( a => <ActivityItem key={'activity.' + a.id} activity={a} labels={labels} lang={lang} /> )}
        </ul>}
      </div>
    </IntlProvider>
  );

}
