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
  enabled,
  groupClassName,
  className,
  value,
  info,
  onKeyDown = () => {},
}) => {
  const [userHasTyped, setUserHasTyped] = useState(false);
  let classNameBis = enabled ? 'form-group' : 'form-group disabled';
  if (groupClassName) classNameBis += ` ${groupClassName}`;

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
            {myGetLabel(error.code, error.values) || 'error'}
          </span>
        )) }
        </p>
      );
    }
    return null;
  };

  return (
    <div className={classNameBis}>
      <label htmlFor="label">{myGetLabel(name)}</label>
      {info && myGetLabel(info)
        ? <div>{myGetLabel(info)}</div>
        : null}
      <div className={className || ''}>
        {type !== 'textarea' ? (
          <input
            className="form-control"
            type="text"
            placeholdcr={myGetLabel(placeholder)}
            value={value || ''}
            onChange={myOnChange}
            disabled={!enabled}
            onKeyDown={e => onKeyDown(e)}
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
    </div>
  );
};

export default InputField;
