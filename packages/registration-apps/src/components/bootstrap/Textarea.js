export default function Textarea({
  id,
  label,
  onChange,
  value,
  placeholder,
  max,
}) {
  return (
    <div className="form-group margin-right-sm">
      {label ? (<label htmlFor={id} className="margin-right-xs">{label}</label>) : null}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        className="form-control"
        placeholder={placeholder}
        maxLength={max}
      />
    </div>
  );
}
