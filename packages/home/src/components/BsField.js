import classNames from 'classnames';

export default function BsField({
  children,
  input: { name, value },
  label,
  subLabel,
  max,
  classNameGroup,
  visible = true,
  errorOnDirty,
  meta: { touched, error, dirty },
  intl,
}) {
  const displayError = errorOnDirty ? dirty || touched : touched;

  if (!visible) {
    return <div />;
  }

  return (
    <div
      className={classNames(
        { 'has-error has-feedback': displayError && error },
        classNameGroup,
      )}
    >
      {label && <label htmlFor={name}>{label}</label>}
      {subLabel}
      {children}
      {displayError && error && (
        <span className="form-control-feedback">
          <i className="fa fa-times" aria-hidden="true" />
        </span>
      )}
      {displayError && error && (
        <div className={classNames('text-danger', { 'pull-left': max })}>
          {error.id && intl && typeof intl.formatMessage === 'function'
            ? intl.formatMessage(error)
            : error}
        </div>
      )}
      {max && (
        <div
          className={classNames('text-right', {
            'text-danger': max - value.length < 0,
          })}
        >
          {max - value.length}
        </div>
      )}
    </div>
  );
}
