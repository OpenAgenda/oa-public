import { useContext, useEffect, useLayoutEffect } from 'react';
import { Form, useForm } from 'react-final-form';
import { createForm } from 'final-form';
import isEqual from 'lodash/isEqual.js';
import useLatestModule from 'react-use/lib/useLatest.js';
import useConstant from '@openagenda/react-shared/hooks/useConstant';
import AppliedValuesContext from '../contexts/AppliedValuesContext.js';

const useLatest = useLatestModule.default || useLatestModule;

const noSubscription = {};
const changeSubscription = { values: true, pristine: true };

function report(error) {
  // eslint-disable-next-line no-console
  console.error('onFilterChange failed', error);
}

// With manual submit, what describes the list renders in a form of its own
// that holds the applied values, not the pending selection: `useActiveFilters`,
// the `*.Preview` components and any field read them, and a value the visitor
// changes there is applied at once. `submit()` and `getSubmittedValues()` are
// the main form's. In automatic mode the children render as they are.
function AppliedForm({ applied, children }) {
  const mainForm = useForm();
  const latestValues = useLatest(applied.values);
  const latestApply = useLatest(applied.apply);

  const appliedForm = useConstant(() => {
    const finalForm = createForm({
      onSubmit: () => {},
      initialValues: applied.values,
    });
    finalForm.submit = () => mainForm.submit();
    finalForm.getSubmittedValues = () => mainForm.getSubmittedValues();
    return finalForm;
  });

  // before paint: a submit never shows the previous badges for a frame
  useLayoutEffect(() => {
    if (!isEqual(appliedForm.getState().values, applied.values)) {
      appliedForm.initialize(applied.values);
    }
  }, [appliedForm, applied.values]);

  useEffect(
    () =>
      appliedForm.subscribe(({ values, pristine }) => {
        // a field registering its initial value leaves the form pristine:
        // only a change makes it dirty
        if (pristine || isEqual(values, latestValues.current)) {
          return;
        }

        // nobody awaits a badge: a failing onFilterChange is reported, not
        // left as an unhandled rejection
        try {
          Promise.resolve(latestApply.current(values)).catch(report);
        } catch (error) {
          report(error);
        }
      }, changeSubscription),
    [appliedForm, latestApply, latestValues],
  );

  return (
    <Form form={appliedForm} subscription={noSubscription}>
      {() => children}
    </Form>
  );
}

export default function AppliedValuesForm({ children }) {
  const applied = useContext(AppliedValuesContext);

  return applied ? (
    <AppliedForm applied={applied}>{children}</AppliedForm>
  )
    : children;
}
