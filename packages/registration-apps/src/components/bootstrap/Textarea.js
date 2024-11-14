import { useEffect, useRef } from 'react';
import autosize from 'autosize';
import FieldCounter from './FieldCounter.js';

export default function Textarea({
  id,
  label,
  onChange,
  value,
  placeholder,
  max,
}) {
  const ref = useRef();

  useEffect(() => {
    autosize(ref.current);
  }, [ref]);

  return (
    <div className="form-group margin-right-sm">
      {label ? (
        <label htmlFor={id} className="margin-right-xs">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={onChange}
        className="form-control"
        placeholder={placeholder}
        maxLength={max}
        rows={3}
      />
      {max ? <FieldCounter value={value} max={max} /> : null}
    </div>
  );
}
