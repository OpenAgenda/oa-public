import Spinner from '@openagenda/react-form-components/build/Spinner';
import MarkdownComponent from '@openagenda/react-form-components/build/MarkdownComponent';
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

export function renderInput({ placeholder, className, spellCheck, ...props }) {
  const inputAttrs = { placeholder, className, spellCheck };

  const content = <input {...props.input} {...inputAttrs} />;

  return renderField.bind(this)({ content, ...props });
}

export function renderCheckbox({
  label,
  id,
  placeholder,
  className,
  spellCheck,
  ...props
}) {
  const inputAttrs = {
    id,
    placeholder,
    className,
    spellCheck,
  };

  const content = (
    <div className="checkbox">
      <label htmlFor={props.id}>
        <input type="checkbox" {...props.input} {...inputAttrs} />
        {label}
      </label>
    </div>
  );

  return renderField.bind(this)({ content, ...props });
}

export function renderTextarea({
  placeholder,
  className,
  rows,
  cols,
  spellCheck,
  ...props
}) {
  const inputAttrs = {
    placeholder,
    className,
    rows,
    cols,
    spellCheck,
  };

  const content = (
    <div>
      <textarea {...props.input} {...inputAttrs} />
    </div>
  );

  return renderField.bind(this)({ content, ...props });
}

export function renderSelect({ className, children, ...props }) {
  const inputAttrs = { className };

  const content = (
    <select {...props.input} {...inputAttrs}>
      {children}
    </select>
  );

  return renderField.bind(this)({ content, ...props });
}

export function renderSearchInput({
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
          <Spinner spinner={searchSpinner} />
        ) : (
          <i className="fa fa-search" aria-hidden="true" />
        )}
      </button>
    </div>
  );

  return renderField.bind(this)({ content, ...props });
}

export function renderMarkdownInput({
  lang = 'fr',
  label,
  placeholder,
  className,
  loadComponent,
  ...props
}) {
  const inputAttrs = {
    lang,
    placeholder,
    label,
    className,
    loadComponent,
  };

  const content = <MarkdownComponent {...props.input} {...inputAttrs} />;

  return renderField.bind(this)({ content, ...props });
}
