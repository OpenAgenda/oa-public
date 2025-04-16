import FieldCounter from './FieldCounter.js';

export default function Input({
  id,
  label,
  type = 'text',
  placeholder,
  sub,
  onChange,
  value = '',
  maxLength = null,
  warning = null,
  info = null,
  step = null,
  max = null,
  min = null,
  error = false,
  optional = true,
  disabled = false,
}) {
  return (
    <div
      className={`form-group margin-right-sm ${warning ? 'has-warning' : ''} ${error && error.length ? 'has-error' : ''}`}
    >
      {label ? (
        <label
          htmlFor={id}
          className={`control-label margin-right-xs ${info ? 'margin-bottom-z' : ''}`}
        >
          {label}
        </label>
      ) : null}
      {!optional ? (
        <span className={`${error && error.length ? 'text-danger' : ''}`}>
          (Champ obligatoire){' '}
        </span>
      ) : null}
      {info ? <div className="margin-bottom-xs">{info}</div> : null}
      <input
        id={id}
        value={value}
        type={type}
        onChange={onChange}
        className="form-control"
        placeholder={placeholder}
        maxLength={maxLength}
        max={max}
        min={min}
        step={step}
        disabled={disabled}
      />
      {maxLength && type === 'string' ? (
        <FieldCounter value={value} max={maxLength} />
      ) : null}
      {sub ? <span className="sub">{sub}</span> : null}
      {error
        && error.length > 0
        && error.map((e) => (
          <div key={e.code} className="text-danger">
            {e.label}
          </div>
        ))}
    </div>
  );
}
