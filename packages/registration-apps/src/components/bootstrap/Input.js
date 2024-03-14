import FieldCounter from './FieldCounter';

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
}) {
  return (
    <div className={`form-group margin-right-sm ${warning ? 'has-warning' : ''}`}>
      {label ? (<label htmlFor={id} className={`margin-right-xs ${info ? 'margin-bottom-z' : ''}`}>{label}</label>) : null}
      {info ? <div className="margin-bottom-xs">{info}</div> : null}
      <input
        id={id}
        value={value}
        type={type}
        onChange={onChange}
        className="form-control"
        placeholder={placeholder}
        maxLength={maxLength}
        step={step}
      />
      {maxLength && type === 'string' ? (<FieldCounter value={value} max={maxLength} />) : null}
      {sub ? <span className="sub">{sub}</span> : null}
    </div>
  );
}
