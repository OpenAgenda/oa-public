import classNames from 'classnames';

export default function FieldCounter({ max, value }) {
  const remaining = () => {
    const nValue = Array.isArray(value) ? value.join('') : value;

    if (!nValue) return max;

    return max - value.length;
  };

  return (
    <div
      className={classNames({ 'field-counter': true, error: remaining() < 0 })}
    >
      {remaining()}
    </div>
  );
}
