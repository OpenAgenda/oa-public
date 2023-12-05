export default function Input({
  id,
  label,
  type = 'text',
  placeholder,
  sub,
  onChange,
  value = '',
}) {
  return (
    <div className="form-group margin-right-sm">
      {label ? (<label htmlFor={id} className="margin-right-xs">{label}</label>) : null}
      <input
        id={id}
        value={value}
        type={type}
        onChange={onChange}
        className="form-control"
        placeholder={placeholder}
      />
      {sub ? <span className="sub">{sub}</span> : null}
    </div>
  );
}
