import { useContext, useEffect, useLayoutEffect } from 'react';
import { Form, useForm } from 'react-final-form';
import { createForm } from 'final-form';
import isEqual from 'lodash/isEqual.js';
import useLatestModule from 'react-use/lib/useLatest.js';
import useConstant from '@openagenda/react-shared/hooks/useConstant';
import AppliedValuesContext from '../contexts/AppliedValuesContext.js';

const useLatest = useLatestModule.default || useLatestModule;

const noSubscription = {};
const changeSubscription = { values: true, initialValues: true };

function report(error) {
  // eslint-disable-next-line no-console
  console.error('onFilterChange failed', error);
}

// nobody awaits a badge: a failing onFilterChange is reported, not left as
// an unhandled rejection
function runApply(apply, values) {
  try {
    Promise.resolve(apply(values)).catch(report);
  } catch (error) {
    report(error);
  }
}

// With manual submit, what describes the list renders in a form of its own
// that holds the applied values, not the pending selection: `useActiveFilters`,
// the `*.Preview` components and any field read them, and a value the visitor
// changes there is applied at once. `submit()` and `getSubmittedValues()` are
// the main form's; `reset()`, `initialize()` and `restart()` apply the values
// they bring, e.g. a "clear all" button. In automatic mode the children
// render as they are.
function AppliedForm({ applied, children }) {
  const mainForm = useForm();
  const latestValues = useLatest(applied.values);
  const latestApply = useLatest(applied.apply);

  const { appliedForm, show } = useConstant(() => {
    const finalForm = createForm({
      onSubmit: () => {},
      initialValues: applied.values,
    });
    finalForm.submit = () => mainForm.submit();
    finalForm.getSubmittedValues = () => mainForm.getSubmittedValues();

    // the form shows the applied values: it only takes others by applying them
    const { initialize } = finalForm;
    const applyAll = (values) => {
      const { initialValues: shown } = finalForm.getState();
      const next = (typeof values === 'function' ? values(shown) : values) ?? shown;

      if (!isEqual(next, latestValues.current)) {
        runApply(latestApply.current, next);
      }
    };
    finalForm.reset = applyAll;
    finalForm.initialize = applyAll;
    finalForm.restart = applyAll;

    return { appliedForm: finalForm, show: initialize };
  });

  // before paint: a submit never shows the previous badges for a frame.
  // Also after a change made here, whose values are already shown: the form
  // starts over from them, pristine again.
  useLayoutEffect(() => {
    show(applied.values);
  }, [show, applied.values]);

  useEffect(
    () =>
      appliedForm.subscribe(({ values, initialValues }) => {
        // a field registering its initial value adds it to both. Not
        // `pristine`: it only counts registered fields, and the custom and
        // favorites badges change values no field registers.
        if (
          isEqual(values, initialValues)
          || isEqual(values, latestValues.current)
        ) {
          return;
        }

        runApply(latestApply.current, values);
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
