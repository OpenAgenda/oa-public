import React from 'react';
import { Form } from 'react-final-form';
import { useConstant } from '@openagenda/react-shared';
import { createForm } from 'final-form';

function FiltersForm({ children }) {
  return children;
}

const defaultSubscription = {};

function FiltersProvider({
  initialValues,
  onSubmit,
  children,
  staticContext,
  subscription = defaultSubscription
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
    <Form form={form} component={FiltersForm} subscription={subscription}>
      {children}

      {/* TODO portals from outside, add <Filter /> with classNames for each */}
    </Form>
  );
}

export default FiltersProvider;
