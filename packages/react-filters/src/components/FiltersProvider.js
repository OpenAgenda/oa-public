import React from 'react';
import { Form } from 'react-final-form';
import { useConstant } from '@openagenda/react-shared';
import { createForm } from 'final-form';
import { IntlProvider } from 'react-intl';
import messages from '../locales-compiled';

function FiltersForm({ children }) {
  return children;
}

const defaultSubscription = {};

function FiltersProvider({
  initialValues,
  onSubmit,
  children,
  staticContext,
  subscription = defaultSubscription,
  locale = 'en'
}) {
  const form = useConstant(() => {
    const finalForm = createForm({
      initialValues,
      onSubmit
    });

    if (staticContext) {
      staticContext.form = finalForm;
    }

    return finalForm;
  });

  return (
    <IntlProvider messages={messages[locale]} locale={locale} key={locale}>
      <Form form={form} component={FiltersForm} subscription={subscription}>
        {children}

        {/* TODO portals from outside, add <Filter /> with classNames for each */}
      </Form>
    </IntlProvider>
  );
}

export default FiltersProvider;
