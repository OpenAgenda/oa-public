const React = require('react');
const { QueryClient, QueryClientProvider } = require('react-query');
const { IntlProvider, injectIntl } = require('react-intl');
const useConstant = require('@openagenda/react-shared/lib/hooks/useConstant');
const mergeLocales = require('@openagenda/react-shared/lib/utils/mergeLocales');
const { locales: reactFiltersLocales, FiltersProvider } = require('@openagenda/react-filters');
const appLocales = require('../../boot/i18n');

const { createElement: el, useMemo } = React;

const locales = mergeLocales(appLocales, reactFiltersLocales);

module.exports = function Provider({
  lang,
  initialValues,
  onFilterChange,
  messages: userMessages,
  children
}) {
  const queryClient = useConstant(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  const messages = useMemo(() => ({ ...locales[lang], ...userMessages }), [userMessages]);

  return el(
    IntlProvider,
    {
      messages,
      locale: lang,
      key: lang
    },
    el(
      QueryClientProvider,
      {
        client: queryClient,
        contextSharing: true
      },
      el(
        injectIntl(FiltersProvider),
        {
          onSubmit: onFilterChange,
          initialValues
        },
        children
      )
    )
  );
};
