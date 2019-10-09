import React from 'react';
import Spinner from '@openagenda/react-form-components/build/Spinner';
import MarkdownComponent from '@openagenda/react-form-components/build/MarkdownComponent';

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

export function renderField( {
                               content, input: { name, value }, label, subLabel, max, classNameGroup, visible,
                               displayError, displayFeedback = true, errorOnDirty, meta
                             } ) {

  const { touched, error, dirty } = meta;
  displayError = displayError ? displayError( meta ) : (errorOnDirty ? dirty || touched : touched);

  if ( visible === false ) return <div></div>;

  return (
    <div className={`form-group ${classNameGroup} ${displayError && error ? 'has-error has-feedback' : ''}`}>
      {label && <label htmlFor={name}>{label}</label>}
      {subLabel}
      {content}
      {displayError && displayFeedback && error && <span className="form-control-feedback">
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

}

export function renderInput( { placeholder, className, spellCheck, ...props } ) {

  const inputAttrs = { placeholder, className, spellCheck };

  const content = <input {...props.input} {...inputAttrs} />;

  return this::renderField( { content, ...props } );

}

export function renderTextarea( { placeholder, className, rows, cols, spellCheck, ...props } ) {

  const inputAttrs = { placeholder, className, rows, cols, spellCheck };

  const content = <div>
    <textarea {...props.input} {...inputAttrs} />
  </div>;

  return this::renderField( { content, ...props } );

}

export function renderSelect( { className, children, ...props } ) {

  const inputAttrs = { className };

  const content = <select {...props.input} {...inputAttrs}>
    {children}
  </select>;

  return this::renderField( { content, ...props } );

}

export function renderSearchInput( { type, placeholder, className, spellCheck, action, loading, ...props } ) {

  const inputAttrs = { type, placeholder, className, spellCheck };
  const onChange = e => {
    props.input.onChange( e.target.value );
    action();
  };

  const content = <div className="input-icon-right">
    <input {...props.input} {...inputAttrs} onChange={onChange} />
    <button type="submit" className="btn">
      {loading ? <Spinner spinner={searchSpinner} /> : <i className="fa fa-search" aria-hidden="true"></i>}
    </button>
  </div>;

  return this::renderField( { content, ...props } );

};

export function renderMarkdownInput( { lang = 'fr', label, placeholder, className, ...props } ) {

  const inputAttrs = { lang, placeholder, label, className };

  const content = <MarkdownComponent
    {...props.input}
    {...inputAttrs}
  />;

  return this::renderField( { content, ...props } );

};
