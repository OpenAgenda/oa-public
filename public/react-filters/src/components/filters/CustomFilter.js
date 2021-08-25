import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { useForm, FormSpy } from 'react-final-form';
import ValueBadge from '../ValueBadge';

const subscription = { values: true };

function matchQuery(a, b) {
  return _.isMatch(_.omitBy(a, _.isEmpty), _.omitBy(b, _.isEmpty));
}

function updateFormValues(form, query, active) {
  form.batch(() => {
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (active) {
          form.change(key, query[key]);
        } else {
          form.change(key, undefined);
        }
      }
    }
  });
}

function updateFilter(filter, active) {
  const activeClass = filter.activeClass || 'active';
  const inactiveClass = filter.inactiveClass || 'inactive';
  const { classList } = filter.elem;

  if (active) {
    if (classList.contains(inactiveClass)) classList.remove(inactiveClass);
    if (!classList.contains(activeClass)) classList.add(activeClass);
  } else {
    if (classList.contains(activeClass)) classList.remove(activeClass);
    if (!classList.contains(inactiveClass)) classList.add(inactiveClass);
  }
}

function DefaultPreviewRenderer({
  label, onRemove, disabled, className
}) {
  return (
    <span className={className}>
      <ValueBadge label={label} onRemove={onRemove} disabled={disabled} />
    </span>
  );
}

function Preview({
  name,
  component = DefaultPreviewRenderer,
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
      // updateFilter(filter, false);
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

function CustomFilter({ filter, query }) {
  const form = useForm();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

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

    const clickHandler = () => {
      updateFormValues(form, filter.query, !matchQuery(query, filter.query));
    };

    const handlerElem = filter.handlerElem || filter.elem;

    handlerElem.addEventListener('click', clickHandler, false);

    const unsubscribe = form.subscribe(
      ({ values }) => updateFilter(filter, matchQuery(values, filter.query)),
      { values: true }
    );

    return () => {
      handlerElem.removeEventListener('click', clickHandler, false);
      unsubscribe();
    };
  }, [filter, form, query]);

  return null;
}

const exported = React.memo(CustomFilter);

// React.memo lose statics
exported.Preview = Preview;

export default exported;
