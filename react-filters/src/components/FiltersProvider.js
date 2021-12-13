import React, { useCallback, useImperativeHandle, useMemo } from 'react';
import { Form, FormSpy } from 'react-final-form';
import apiClient from '@openagenda/react-shared/lib/utils/apiClient';
import mergeLocales from '@openagenda/react-shared/lib/utils/mergeLocales';
import useConstant from '@openagenda/react-shared/lib/hooks/useConstant';
import ApiClientContext from '@openagenda/react-shared/lib/contexts/ApiClientContext';
import { createForm } from 'final-form';
import { IntlProvider, RawIntlProvider } from 'react-intl';
import { QueryClient, QueryClientProvider } from 'react-query';
import appLocales from '../locales';
import filtersToAggregations from '../utils/filtersToAggregations';

const defaultSubscription = {};
const spySubscription = { dirty: true, values: true };

function FiltersForm({ children }) {
  return children;
}

function FiltersProvider(
  {
    children,
    subscription = defaultSubscription,
    intl,
    locale = 'en',
    locales: userLocales,
    filters,
    // for test
    apiClient: customApiClient,
    // form config
    debug,
    destroyOnUnregister,
    initialValues,
    keepDirtyOnReinitialize,
    mutators,
    onSubmit,
    validate,
    validateOnBlur,
  },
  ref
) {
  const apiClientInstance = useConstant(() => customApiClient || apiClient());

  const queryClient = useConstant(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  const handleSubmit = useCallback((values, form) => {
    const aggregations = filtersToAggregations(filters);

    return onSubmit(values, aggregations, form);
  }, [filters, onSubmit]);

  const form = useConstant(() => createForm({
    debug,
    destroyOnUnregister,
    initialValues,
    keepDirtyOnReinitialize,
    mutators,
    onSubmit: handleSubmit,
    validate,
    validateOnBlur,
  }));

  useImperativeHandle(ref, () => form);

  const locales = useMemo(
    () => mergeLocales(appLocales, userLocales || {}),
    [userLocales]
  );

  const onValueChange = useCallback(({ dirty, values }) => {
    if (dirty) {
      form.submit();
      form.reset(values);
    }
  }, [form]);

  const child = (
    <ApiClientContext.Provider value={apiClientInstance}>
      <QueryClientProvider client={queryClient}>
        <Form
          form={form}
          component={FiltersForm}
          subscription={subscription}
        >
          {children}

          <FormSpy
            subscription={spySubscription}
            onChange={onValueChange}
          />
        </Form>
      </QueryClientProvider>
    </ApiClientContext.Provider>
  );

  if (intl) {
    return <RawIntlProvider value={intl}>{child}</RawIntlProvider>;
  }

  return (
    <IntlProvider messages={locales[locale]} locale={locale} key={locale}>
      {child}
    </IntlProvider>
  );
}

export default React.forwardRef(FiltersProvider);
