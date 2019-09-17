import React from 'react';
import cn from 'classnames';
import Spinner from '@openagenda/react-components/build/Spinner';
import MarkdownComponent from '@openagenda/react-form-components/build/MarkdownComponent';

const searchSpinner = {
  width: 1,
  length: 3,
  radius: 4
};

export function renderField( props ) {
  const {
    content, input: { name, value }, label, subLabel, max, classNameGroup,
    visible, displayFeedback, errorOnDirty, meta, getErrorLabel
  } = props;

  const { touched, error, dirty } = meta;
  const displayError = props.displayError ? props.displayError( meta ) : (errorOnDirty ? dirty && touched : touched);

  if ( visible === false ) return <div></div>;

  const className = cn(
    'form-group',
    classNameGroup,
    {
      'has-error has-feedback': displayError && error
    }
  );

  const errorClassName = cn(
    'text-danger',
    {
      'pull-left': max
    }
  );

  const maxClassName = cn(
    'text-right',
    {
      'text-danger': max - value.length < 0
    }
  );

  return (
    <div className={className}>
      {label && <label htmlFor={name}>{label}</label>}
      {subLabel}
      {content}
      {displayError && displayFeedback && error && <span className="form-control-feedback">
          <i className="fa fa-times" aria-hidden="true"></i>
        </span>}
      {displayError && error && <div className={errorClassName}>
        {getErrorLabel( error )}
      </div>}
      {max && <div className={maxClassName}>
        {max - value.length}
      </div>}
    </div>
  );

}

export function renderInput( { placeholder, className, spellCheck, ...props } ) {

  const inputAttrs = { placeholder, className, spellCheck };

  const content = <input {...props.input} {...inputAttrs} />;

  return renderField( { content, ...props } );

}

export function renderTextarea( { placeholder, className, rows, cols, spellCheck, onKeyDown, autoFocus, ...props } ) {

  const inputAttrs = { placeholder, className, rows, cols, spellCheck, onKeyDown, autoFocus };

  const content = <div>
    <textarea {...props.input} {...inputAttrs} />
  </div>;

  return renderField( { content, ...props } );

}

export function renderSelect( { className, children, ...props } ) {

  const inputAttrs = { className };

  const content = <select {...props.input} {...inputAttrs}>
    {children}
  </select>;

  return renderField( { content, ...props } );

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

  return renderField( { content, ...props } );

};

export function renderMarkdownInput( { lang = 'fr', label, placeholder, className, ...props } ) {

  const inputAttrs = { lang, placeholder, label, className };

  const content = <MarkdownComponent
    {...props.input}
    {...inputAttrs}
  />;

  return renderField( { content, ...props } );

};
