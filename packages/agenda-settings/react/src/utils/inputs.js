import React from 'react';

export function renderField ( {
  content, input: { name, value }, label, subLabel, max,
  errorOnDirty, meta: { touched, error, dirty }
} ) {
  const displayError = errorOnDirty ? dirty || touched : touched;
  return (
    <div className={`form-group ${displayError && error ? 'has-error has-feedback' : ''}`}>
      {label && <label htmlFor={name}>{label}</label>}
      {subLabel}
      {content}
      {displayError && error && <span className="form-control-feedback">
          <i className="fa fa-times" aria-hidden="true"></i>
        </span>}
      {displayError && error && <div className={`text-danger ${max && 'pull-left' || ''}`}>
        {this.context.getLabel( error )}
      </div>}
      {max && <div className={`text-right ${max - value.length < 0 && 'text-danger' || ''}`}>
        {max - value.length}
      </div>}
    </div>
  );
};

export function renderInput ( { type, placeholder, className, spellCheck, ...props } ) {
  const inputAttrs = { type, placeholder, className, spellCheck };
  const content = <input {...props.input} {...inputAttrs} />;
  return renderField.bind(this)( { content, ...props } );
};

export function renderTextarea ( { placeholder, className, rows, cols, spellCheck, ...props } ) {
  const inputAttrs = { placeholder, className, rows, cols, spellCheck };
  const content = (
    <div>
      <textarea {...props.input} {...inputAttrs} />
    </div>);
  return renderField.bind(this)( { content, ...props } );
};

export function renderInputGroup ( { type, placeholder, className, before, after, spellCheck, ...props } ) {
  const inputAttrs = { type, placeholder, className, spellCheck };
  const content = (
    <div className="input-group">
      {before}
      <input {...props.input} {...inputAttrs} />
      {after}
    </div>);
  return renderField.bind(this)( { content, ...props } );
};
