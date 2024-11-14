import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { IntlProvider } from 'react-intl';
import { useConstant } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import { locales as memberAppsLocales } from '@openagenda/member-apps';

const lang = 'fr';

export default (Story) => {
  const queryClient = useConstant(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      // eslint-disable-next-line import/namespace
      messages={memberAppsLocales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <Story />
        </HelmetProvider>
      </QueryClientProvider>
    </IntlProvider>
  );
};
