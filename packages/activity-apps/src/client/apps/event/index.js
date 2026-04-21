import { IntlProvider } from 'react-intl';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';
import * as commonLocales from '@openagenda/common-labels';
import { ActivityItem } from '../../components/index.js';
import * as appLocales from '../../../locales-compiled/index.js';

import 'moment/locale/fr.js';

const locales = mergeLocales(appLocales, commonLocales);

export default function (options) {
  const { lang, activities, config } = {
    activities: [],
    config: {},
    lang: 'fr',
    ...options,
  };

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div>
        {activities && activities.length > 0 && (
          <ul className="list-unstyled activity-list">
            {activities.map((a) => (
              <ActivityItem
                key={`activity.${a.id}`}
                activity={a}
                config={config}
              />
            ))}
          </ul>
        )}
      </div>
    </IntlProvider>
  );
}
