import { useMemo } from 'react';
import { IntlProvider as ReactIntlProvider } from 'react-intl';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';
import appLocales from '../locales-compiled';

export default function IntlProvider({ locale, userLocales = null, children }) {
  const locales = useMemo(
    () => mergeLocales(appLocales, userLocales || {}),
    [userLocales],
  );

  return (
    <ReactIntlProvider
      key={locale}
      locale={locale}
      messages={locales[locale]}
      defaultLocale={getSupportedLocale(locale)}
    >
      {children}
    </ReactIntlProvider>
  );
}
