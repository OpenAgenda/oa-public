export default function Input({
  id,
  label,
  type = 'text',
  placeholder,
  onChange,
  value = '',
}) {
  return (
    <div className="form-group margin-right-sm">
      <label htmlFor={id} className="margin-right-xs">{label}</label>
      <input
        id={id}
        value={value}
        type={type}
        onChange={onChange}
        className="form-control"
        placeholder={placeholder}
      />
    </div>
  );
}
