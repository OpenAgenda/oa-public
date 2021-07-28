const React = require('react');
const { QueryClient, QueryClientProvider } = require('react-query');
const { IntlProvider, injectIntl } = require('react-intl');
const useConstant = require('@openagenda/react-shared/lib/hooks/useConstant');
const mergeLocales = require('@openagenda/react-shared/lib/utils/mergeLocales');
const { locales: reactFiltersLocales, FiltersProvider } = require('@openagenda/react-filters');
const appLocales = require('../../boot/i18n');

const { createElement: el } = React;

const locales = mergeLocales(appLocales, reactFiltersLocales);

module.exports = function Provider({
  lang,
  initialValues,
  onFilterChange,
  children
}) {
  const queryClient = useConstant(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  return el(
    IntlProvider,
    {
      messages: locales[lang],
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
