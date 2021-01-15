import React, { useImperativeHandle } from 'react';
import { Form } from 'react-final-form';
import { useConstant } from '@openagenda/react-shared';
import { createForm } from 'final-form';
import { IntlProvider, RawIntlProvider } from 'react-intl';
import messages from '../locales-compiled';

function FiltersForm({ children }) {
  return children;
}

const defaultSubscription = {};

function FiltersProvider(
  {
    children,
    staticContext,
    subscription = defaultSubscription,
    intl,
    locale = 'en',
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
  const form = useConstant(() => {
    const finalForm = createForm({
      debug,
      destroyOnUnregister,
      initialValues,
      keepDirtyOnReinitialize,
      mutators,
      onSubmit,
      validate,
      validateOnBlur,
    });

    if (staticContext) {
      staticContext.form = finalForm;
    }

    return finalForm;
  });

  useImperativeHandle(ref, () => form);

  const child = (
    <Form form={form} component={FiltersForm} subscription={subscription}>
      {children}

      {/* TODO portals from outside, add <Filter /> with classNames for each */}
    </Form>
  );

  if (intl) {
    return <RawIntlProvider value={intl}>{child}</RawIntlProvider>;
  }

  return (
    <IntlProvider messages={messages[locale]} locale={locale} key={locale}>
      {child}
    </IntlProvider>
  );
}

export default React.forwardRef(FiltersProvider);
