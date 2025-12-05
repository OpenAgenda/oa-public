import { useEffect, useState } from 'react';
import isAllCaps from '../../utils/isAllCaps.js';

const handleClassName = (enabled, className = '') => {
  if (enabled) {
    return `form-group ${className}`;
  }
  return `form-group ${className} disabled`;
};

const InputField = ({
  lang,
  name,
  required,
  getLabel,
  onChange,
  validator,
  placeholder,
  type,
  renderButton,
  enabled,
  groupClassName = '',
  className,
  value,
  info,
  onKeyDown = () => {},
  warnAllCaps = false,
  warnAllCapsMessage,
}) => {
  const [userHasTyped, setUserHasTyped] = useState(false);
  const [validateErrors, setValidateErrors] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);

  const [classNameBis, setClassNameBis] = useState(
    handleClassName(enabled, groupClassName),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 1000);

    return () => clearTimeout(timer);
  }, [value]);

  const hasAllCapsWarning = warnAllCaps && isAllCaps(debouncedValue);

  useEffect(() => {
    setClassNameBis(handleClassName(enabled, groupClassName));
    setValidateErrors(false);
    if (!validator || !userHasTyped) return;

    try {
      validator(value);
    } catch (errors) {
      setValidateErrors(errors);
      setClassNameBis(`${handleClassName(enabled, groupClassName)} has-error`);
      return;
    }
    setClassNameBis(
      handleClassName(enabled, groupClassName.replace('has-error', '')),
    );
    setValidateErrors(false);
  }, [value, validator, userHasTyped, enabled, groupClassName]);

  const myOnChange = (e) => {
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

  const renderErrors = (errors) => (
    <p>
      {errors.map((error) => (
        <span key={error.code} className="error">
          {myGetLabel(error.code, error.values) || 'error'}
        </span>
      ))}
    </p>
  );

  return (
    <div className={classNameBis}>
      <label htmlFor="label" className="control-label">
        {`${myGetLabel(name)} ${required ? myGetLabel('requiredField') : ''}`}
      </label>
      {info && myGetLabel(info) ? <div>{myGetLabel(info)}</div> : null}
      <div className={hasAllCapsWarning ? 'has-warning' : ''}>
        <div className={className || ''}>
          {type !== 'textarea' ? (
            <input
              className="form-control"
              type="text"
              placeholder={myGetLabel(placeholder)}
              value={value || ''}
              onChange={myOnChange}
              disabled={!enabled}
              onKeyDown={(e) => onKeyDown(e)}
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
        {hasAllCapsWarning && warnAllCapsMessage ? (
          <p className="sub warning">{warnAllCapsMessage}</p>
        ) : null}
      </div>
      {validateErrors ? renderErrors(validateErrors) : null}
    </div>
  );
};

export default InputField;
