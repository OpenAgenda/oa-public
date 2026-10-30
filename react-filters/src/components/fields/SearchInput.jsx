import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import get from 'lodash/get.js';
import { useForm, useFormState } from 'react-final-form';
import { useDebouncedCallback } from 'use-debounce';
import { defineMessages, useIntl } from 'react-intl';
import { useUID } from 'react-uid';
import FiltersAndWidgetsContext from '../../contexts/FiltersAndWidgetsContext.js';

// A submit changes the applied value: re-render to update the button
const submitSubscription = {
  submitSucceeded: true,
  dirtySinceLastSubmit: true,
};
const noSubscription = {};

const messages = defineMessages({
  ariaLabel: {
    id: 'ReactFilters.components.fields.SearchInput.ariaLabel',
    defaultMessage: 'Search',
  },
  ariaLabelReset: {
    id: 'ReactFilters.components.fields.SearchInput.ariaLabelReset',
    defaultMessage: 'Reset search',
  },
});

function Input({
  input,
  placeholder,
  label,
  ariaLabel,
  onButtonClick,
  isResetButton = false,
}) {
  const intl = useIntl();
  const inputId = `oa-filters-search-${useUID()}`;

  const group = (
    <div className="input-group mb-3">
      <input
        id={label ? inputId : undefined}
        className="form-control"
        autoComplete="off"
        placeholder={placeholder}
        aria-label={label ? undefined : ariaLabel}
        title={ariaLabel}
        {...input}
      />
      <div className="input-group-append">
        <button
          type={isResetButton ? 'button' : 'submit'}
          className="btn btn-outline-secondary"
          onClick={onButtonClick}
          aria-label={
            isResetButton
              ? intl.formatMessage(messages.ariaLabelReset)
              : intl.formatMessage(messages.ariaLabel)
          }
        >
          {isResetButton ? (
            <i className="fa fa-times" aria-hidden="true" />
          ) : (
            <i className="fa fa-search" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );

  if (!label) {
    return group;
  }

  return (
    <>
      <label htmlFor={inputId} className="oa-filters-search-label">
        {label}
      </label>
      {group}
    </>
  );
}

export default function SearchInput({
  inputComponent = Input,
  input,
  onChange, // user onChange
  manualSearch,
  displayReset = false,
  ...rest
}) {
  const form = useForm();
  const [tmpValue, setTmpValue] = useState(input.value);

  const {
    filtersOptions: { manualSubmit },
  } = useContext(FiltersAndWidgetsContext);

  useFormState({
    subscription: manualSubmit ? submitSubscription : noSubscription,
  });

  // With manualSubmit the field holds the typed text at once: the reset only
  // shows on the text that is applied, the search button stays until then
  const isApplied = () =>
    tmpValue
    === get(form.getSubmittedValues() ?? form.getState().initialValues, input.name);
  const isResetButton = displayReset && tmpValue && (!manualSubmit || isApplied());

  const debouncedOnChange = useDebouncedCallback((e) => {
    // With manualSubmit the form already waits for a submit: the value goes
    // to it, so that it counts as pending and the page's submit carries it
    if (manualSearch && !manualSubmit) {
      return;
    }

    input.onChange(e);
    if (typeof onChange === 'function') {
      onChange(e.target.value);
    }
  }, 400);

  const inputOnChange = useCallback(
    (e) => {
      e.persist();

      setTmpValue(e.target.value);
      debouncedOnChange(e);
      // direct call with manualSubmit
      if (manualSubmit) {
        debouncedOnChange.flush();
      }
    },
    [debouncedOnChange, manualSubmit],
  );

  const onButtonClick = useCallback(
    (e) => {
      e.preventDefault();

      if (displayReset && isResetButton) {
        input.onChange('');
        if (typeof onChange === 'function') {
          onChange(tmpValue);
        }
        return form.submit();
      }

      // With manualSubmit the form already holds the typed text
      if (manualSearch && !manualSubmit) {
        input.onChange(tmpValue);
        if (typeof onChange === 'function') {
          onChange(tmpValue);
        }
      }
      return form.submit();
    },
    [
      form,
      input,
      manualSearch,
      manualSubmit,
      onChange,
      tmpValue,
      isResetButton,
      displayReset,
    ],
  );

  const wrappedInput = useMemo(
    () => ({
      ...input,
      value: tmpValue,
      onChange: inputOnChange,
    }),
    [input, inputOnChange, tmpValue],
  );

  useEffect(() => {
    setTmpValue(input.value);
  }, [input.value]);

  return React.createElement(inputComponent, {
    input: wrappedInput,
    onButtonClick,
    manualSubmit,
    isResetButton,
    ...rest,
  });
}
