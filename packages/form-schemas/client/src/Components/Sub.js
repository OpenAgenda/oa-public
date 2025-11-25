import classNames from 'classnames';

export default function Sub({ error, label, warning }) {
  return (
    <div
      className={classNames({
        sub: true,
        error: !!error,
        'has-warning': !!warning && !error,
      })}
    >
      {error || warning || label}
    </div>
  );
}
