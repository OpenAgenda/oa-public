import { useEffect, useRef } from 'react';
import autosize from 'autosize';

const style = {
  resize: 'none',
};

export default function TextField(props) {
  const {
    field,
    value,
    enabled,
    onChange,
  } = props;

  const {
    field: name,
    placeholder,
    fieldType,
    default: defaultValue,
  } = field;

  const ref = useRef();

  useEffect(() => {
    autosize(ref.current);
  }, [ref]);

  return (
    <textarea
      ref={ref}
      name={name}
      rows={fieldType === 'textarea' ? 3 : 1}
      value={value ?? (defaultValue ?? '')}
      placeholder={placeholder}
      className="form-control"
      style={style}
      onKeyDown={e => {
        if (fieldType !== 'text' || e.key !== 'Enter') {
          return;
        }
        e.preventDefault();
      }}
      onChange={e => {
        e.preventDefault();
        onChange(e.target.value);
      }}
      disabled={!enabled}
    />
  );
}
