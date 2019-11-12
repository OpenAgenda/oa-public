import React from 'react';
import MarkdownComponent from '@openagenda/react-form-components/build/MarkdownComponent';
import classNames from 'classnames';

export function renderField( {
                               content, input: { name, value, type }, label, subLabel, max,
                               displayError, formGroupClass = true, meta, meta: { error, touched, dirty }
                             } ) {
  const errorDisplayed = displayError ? displayError( meta ) : dirty && touched;
  return (
    <div
      className={classNames( {
        'form-group': type !== 'hidden' || !formGroupClass,
        'has-error has-feedback': errorDisplayed && error
      } )}
    >
      {label && <label htmlFor={name}>{label}</label>}
      {subLabel}
      {content}
      {errorDisplayed && error && <div className={`text-danger ${max && 'pull-left' || ''}`}>
        {this.context.getLabel( error )}
      </div>}
      {max && <div className={`text-right ${max - value.length < 0 && 'text-danger' || ''}`}>
        {max - value.length}
      </div>}
    </div>
  );
};

export function renderInput( { type, placeholder, className, spellCheck, ...props } ) {
  const inputAttrs = { type, placeholder, className, spellCheck };
  const content = <input {...props.input} {...inputAttrs} />;
  return renderField.bind( this )( { content, ...props } );
};

export function renderTextarea( { placeholder, className, rows, cols, spellCheck, ...props } ) {
  const inputAttrs = { placeholder, className, rows, cols, spellCheck };
  const content = (
    <div>
      <textarea {...props.input} {...inputAttrs} />
    </div>);
  return renderField.bind( this )( { content, ...props } );
};

export function renderInputGroup( { type, placeholder, className, before, after, spellCheck, ...props } ) {
  const inputAttrs = { type, placeholder, className, spellCheck };
  const content = (
    <div className="input-group">
      {before}
      <input {...props.input} {...inputAttrs} />
      {after}
    </div>);
  return renderField.bind( this )( { content, ...props } );
};

export function renderMarkdownInput( { placeholder, className = '', lang = 'fr', ...props } ) {
  const inputAttrs = { placeholder, className, lang };
  const content = <MarkdownComponent {...props.input} {...inputAttrs} />;
  return renderField.bind( this )( { content, ...props } );
}
