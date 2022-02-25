import React, { useCallback, useEffect, useRef } from 'react';
import { useForm, FormSpy } from 'react-final-form';
import matchQuery from '../../utils/matchQuery';
import updateFormValues from '../../utils/updateFormValues';
import updateCustomFilter from '../../utils/updateCustomFilter';
import FilterPreviewer from '../FilterPreviewer';

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
    e => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      updateFormValues(form, filter.query, false);
    },
    [disabled, form, filter]
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

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

      const query = form.getState().values;
      const matchInitialQuery = matchQuery(query, filter.query);
      const registeredFields = form.getRegisteredFields();

      for (const key in filter.query) {
        if (Object.prototype.hasOwnProperty.call(filter.query, key)) {
          if (!registeredFields.includes(key)) {
            form.registerField(key, () => {
            }, { value: true }, {
              initialValue: matchInitialQuery ? filter.query[key] : undefined
            });
          }
        }
      }
    }

    const clickHandler = e => {
      e.preventDefault();
      const query = form.getState().values;

      updateFormValues(form, filter.query, !matchQuery(query, filter.query));
    };

    const handlerElem = filter.handlerElem || filter.elem;
    const innerCheckboxes = handlerElem.querySelectorAll('input[type="checkbox"]');

    if (innerCheckboxes.length === 1 && !filter.handlerElem) {
      innerCheckboxes[0].addEventListener('change', clickHandler, false);
    } else {
      handlerElem.addEventListener('click', clickHandler, false);
    }

    const unsubscribe = form.subscribe(
      ({ values }) => updateCustomFilter(filter, matchQuery(values, filter.query)),
      { values: true }
    );

    return () => {
      if (innerCheckboxes.length === 1 && !filter.handlerElem) {
        innerCheckboxes[0].removeEventListener('change', clickHandler, false);
      } else {
        handlerElem.removeEventListener('click', clickHandler, false);
      }
      unsubscribe();
    };
  }, [filter, form]);

  return null;
}

const exported = React.memo(CustomFilter);

// React.memo lose statics
exported.Preview = Preview;

export default exported;
