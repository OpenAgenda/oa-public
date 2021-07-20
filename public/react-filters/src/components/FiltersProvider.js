import React, { useCallback, useImperativeHandle } from 'react';
import { Form, FormSpy } from 'react-final-form';
import { useConstant } from '@openagenda/react-shared';
import { createForm } from 'final-form';
import { IntlProvider, RawIntlProvider } from 'react-intl';
import messages from '../locales-compiled';

function FiltersForm({ children }) {
  return children;
}

const defaultSubscription = {};
const spySubscription = { dirty: true, values: true };

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

  const onValueChange = useCallback(({ dirty, values }) => {
    if (dirty) {
      form.submit();
      form.reset(values);
    }
  }, [form]);

  const child = (
    <Form form={form} component={FiltersForm} subscription={subscription}>
      {children}

      <FormSpy
        subscription={spySubscription}
        onChange={onValueChange}
      />
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
