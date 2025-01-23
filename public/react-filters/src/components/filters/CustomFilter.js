import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm, FormSpy } from 'react-final-form';
import a11yButtonActionHandler from '@openagenda/react-shared/dist/utils/a11yButtonActionHandler.js';
import matchQuery from '../../utils/matchQuery.js';
import updateFormValues from '../../utils/updateFormValues.js';
import updateCustomFilter from '../../utils/updateCustomFilter.js';
import FilterPreviewer from '../FilterPreviewer.js';

const subscription = { values: true };

function Preview({
  name,
  component = FilterPreviewer,
  disabled,
  activeFilterLabel,
  filter,
  query,
  ...rest
}) {
  const form = useForm();

  const onRemove = useCallback(
    (e) => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      updateFormValues(form, filter.query, false);
    },
    [disabled, form, filter],
  );

  return (
    <FormSpy subscription={subscription}>
      {({ values }) => {
        if (!matchQuery(values, query) || !activeFilterLabel) {
          return null;
        }

        return React.createElement(component, {
          name,
          label: activeFilterLabel,
          onRemove,
          disabled,
          filter,
          ...rest,
        });
      }}
    </FormSpy>
  );
}

function CustomFilter({ filter }) {
  const form = useForm();
  const firstRender = useRef(true);

  const updateForm = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const query = form.getState().values;

      updateFormValues(form, filter.query, !matchQuery(query, filter.query));
    },
    [filter.query, form],
  );

  const onChange = useMemo(
    () => a11yButtonActionHandler(updateForm),
    [updateForm],
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

      const query = form.getState().values;
      const matchInitialQuery = matchQuery(query, filter.query);
      const registeredFields = form.getRegisteredFields();

      for (const key in filter.query) {
        if (Object.prototype.hasOwnProperty.call(filter.query, key)) {
          if (!registeredFields.includes(key)) {
            form.registerField(
              key,
              () => {},
              { value: true },
              {
                initialValue: matchInitialQuery ? filter.query[key] : undefined,
              },
            );
          }
        }
      }
    }

    const handlerElem = filter.handlerElem || filter.elem;
    const innerCheckboxes = handlerElem.querySelectorAll(
      'input[type="checkbox"]',
    );

    const handlerIsLabelWithCheckbox = innerCheckboxes.length === 1
      && handlerElem.tagName === 'LABEL'
      && handlerElem.contains(innerCheckboxes[0]);

    if (
      innerCheckboxes.length === 1
      && (!filter.handlerElem || handlerIsLabelWithCheckbox)
    ) {
      innerCheckboxes[0].addEventListener('change', updateForm, false);
    } else {
      handlerElem.addEventListener('click', onChange, false);
    }

    handlerElem.addEventListener('keydown', onChange, false);

    const unsubscribe = form.subscribe(
      ({ values }) =>
        updateCustomFilter(filter, matchQuery(values, filter.query)),
      { values: true },
    );

    return () => {
      if (
        innerCheckboxes.length === 1
        && (!filter.handlerElem || handlerIsLabelWithCheckbox)
      ) {
        innerCheckboxes[0].removeEventListener('change', updateForm, false);
      } else {
        handlerElem.removeEventListener('click', onChange, false);
      }

      handlerElem.removeEventListener('keydown', onChange, false);

      unsubscribe();
    };
  }, [filter, form, onChange, updateForm]);

  return null;
}

const exported = React.memo(CustomFilter);

// React.memo lose statics
exported.Preview = Preview;

export default exported;
