import React from 'react';
import { IntlProvider } from 'react-intl';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';
import commonLocales from '@openagenda/common-labels';
import { ActivityItem } from '../../components';
import appLocales from '../../../locales-compiled';

import 'moment/locale/fr';

const locales = mergeLocales(appLocales, commonLocales);

export default function(options) {

  const { lang, activities, config } = Object.assign({
    activities: [],
    config: {},
    lang: 'fr',
  }, options);

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div>
        {(activities && activities.length > 0) && <ul className="list-unstyled activity-list">
          {activities.map(a => (
            <ActivityItem
              key={'activity.' + a.id}
              activity={a}
              config={config}
            />
          ))}
        </ul>}
      </div>
    </IntlProvider>
  );

}
