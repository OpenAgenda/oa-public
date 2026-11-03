import { useContext, useEffect, useRef } from 'react';
import { Form } from 'react-final-form';
import { createForm } from 'final-form';
import isEqual from 'lodash/isEqual.js';
import useConstant from '@openagenda/react-shared/hooks/useConstant';
import AppliedValuesContext from '../contexts/AppliedValuesContext.js';

const noSubscription = {};

// With manual submit, what describes the list renders in a form of its own
// that holds the applied values, not the pending selection: `useActiveFilters`,
// the `*.Preview` components and any field read them, and a value changed
// there is applied at once. In automatic mode the children render as they are.
function AppliedForm({ applied, children }) {
  const { values, apply } = applied;
  const appliedRef = useRef(values);
  appliedRef.current = values;
  const applyRef = useRef(apply);
  applyRef.current = apply;

  const appliedForm = useConstant(() =>
    createForm({ onSubmit: () => {}, initialValues: values }));

  useEffect(() => {
    if (!isEqual(appliedForm.getState().values, values)) {
      appliedForm.initialize(values);
    }
  }, [appliedForm, values]);

  useEffect(
    () =>
      appliedForm.subscribe(
        ({ values: next }) => {
          if (isEqual(next, appliedRef.current)) {
            return;
          }

          // nobody awaits a badge: a failing onFilterChange is reported, not
          // left as an unhandled rejection
          const report = (error) => {
            // eslint-disable-next-line no-console
            console.error('onFilterChange failed', error);
          };

          try {
            Promise.resolve(applyRef.current(next)).catch(report);
          } catch (error) {
            report(error);
          }
        },
        { values: true },
      ),
    [appliedForm],
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
