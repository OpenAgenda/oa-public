import React, { useState } from 'react';

const InputField = ({
  lang,
  name,
  getLabel,
  onChange,
  validator,
  placeholder,
  type,
  renderButton,
  autoFocus,
  enabled,
  groupClassName,
  ClassName,
  value,
  info,
  bottom
}) => {
  const [userHasTyped, setUserHasTyped] = useState(false);

  const myOnChange = e => {
    if (!enabled) return;

    setUserHasTyped(true);
    onChange(name, e.target.value);
  };

  const myGetLabel = (label, values) => {
    if (getLabel) {
      return getLabel(label, values, lang);
    }
    return null;
  };

  const renderErrors = () => {
    if (!validator) return null;

    if ((!value || !value.length) && !userHasTyped) return null;

    try {
      validator(value);
    } catch (errors) {
      return (
        <p>{ errors.map(error => (
          <span
            key={error.code}
            className="error"
          >
            {getLabel(error.code, error.values, lang)}
          </span>
        )) }
        </p>
      );
    }
    return null;
  };

  return (
    <div className={ClassName}>
      <label htmlFor="label">{myGetLabel(name)}</label>
      {info && myGetLabel(info)
        ? <div>{myGetLabel(info)}</div>
        : null}
      <div className={ClassName || ''}>
        {type !== 'textarea' ? (
          <input
            className="form-control"
            type="text"
            placeholder={myGetLabel(placeholder)}
            value={value}
            onChange={myOnChange}
            disabled={!enabled}
          />
        ) : (
          <textarea
            className="form-control"
            value={value}
            rows={6}
            disabled={!enabled}
            onChange={myOnChange}
          />
        )}
        {renderButton ? renderButton() : ''}
      </div>
      {renderErrors()}
      {bottom || null}
    </div>
  );
};

export default InputField;
