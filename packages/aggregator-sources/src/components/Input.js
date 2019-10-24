import React from 'react';

export default function Input({
  children,
  input: { name, value },
  label,
  subLabel,
  max,
  classNameGroup,
  visible = true,
  errorOnDirty,
  meta: { touched, error, dirty },
  intl
}) {
  const displayError = errorOnDirty ? dirty || touched : touched;

  if (!visible) {
    return <div />;
  }

  return (
    <div
      className={`form-group ${classNameGroup} ${
        displayError && error ? 'has-error has-feedback' : ''
      }`}
    >
      {label && <label htmlFor={name}>{label}</label>}
      {subLabel}
      {children}
      {displayError && error && (
        <span className="form-control-feedback">
          <i className="fa fa-times" aria-hidden="true" />
        </span>
      )}
      {displayError && error && (
        <div className={`text-danger ${max ? 'pull-left' : ''}`}>
          {error.id && intl && typeof intl.formatMessage === 'function'
            ? intl.formatMessage(error)
            : error}
        </div>
      )}
      {max && (
        <div
          className={`text-right ${
            max - value.length < 0 ? 'text-danger' : ''
          }`}
        >
          {max - value.length}
        </div>
      )}
    </div>
  );
}
