import { Spinner } from '@openagenda/react-shared';

import I18nContext from '../contexts/I18nContext';

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4,
};

export function renderField({
  content,
  input: { name, value },
  label,
  subLabel,
  max,
  classNameGroup,
  visible,
  displayError,
  displayFeedback = true,
  errorOnDirty,
  meta,
}) {
  const { touched, error, dirty } = meta;
  let errorDisplayed;

  if (displayError) {
    errorDisplayed = displayError(meta);
  } else if (errorOnDirty) {
    errorDisplayed = dirty || touched;
  } else {
    errorDisplayed = touched;
  }

  if (visible === false) {
    return <div />;
  }

  return (
    <I18nContext.Consumer>
      {({ getLabel }) => (
        <div
          className={`form-group ${classNameGroup} ${
            errorDisplayed && error ? 'has-error has-feedback' : ''
          }`}
        >
          {label && <label htmlFor={name}>{label}</label>}
          {subLabel}
          {content}
          {errorDisplayed && displayFeedback && error && (
            <span className="form-control-feedback">
              <i className="fa fa-times" aria-hidden="true" />
            </span>
          )}
          {errorDisplayed && error && (
            <div className={`text-danger ${(max && 'pull-left') || ''}`}>
              {getLabel(error)}
            </div>
          )}
          {max && (
            <div
              className={`text-right ${
                (max - value.length < 0 && 'text-danger') || ''
              }`}
            >
              {max - value.length}
            </div>
          )}
        </div>
      )}
    </I18nContext.Consumer>
  );
}

export default function renderSearchInput({
  type,
  placeholder,
  className,
  spellCheck,
  action,
  loading,
  ...props
}) {
  const inputAttrs = {
    type,
    placeholder,
    className,
    spellCheck,
  };
  const onChange = e => {
    props.input.onChange(e.target.value);
    action();
  };

  const content = (
    <div className="input-icon-right">
      <input {...props.input} {...inputAttrs} onChange={onChange} />
      <button type="submit" className="btn">
        {loading ? (
          <Spinner options={searchSpinner} />
        ) : (
          <i className="fa fa-search" aria-hidden="true" />
        )}
      </button>
    </div>
  );

  return renderField.bind(this)({ content, ...props });
}
