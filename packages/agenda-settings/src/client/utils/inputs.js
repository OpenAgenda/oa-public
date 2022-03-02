import React, { useContext } from 'react';
import MarkdownComponent from '@openagenda/react-form-components/build/MarkdownComponent';
import classNames from 'classnames';
import I18nContext from '../contexts/I18nContext';

export function BaseField({
  children, input: { name, value, type }, label, subLabel, max,
  displayError, formGroupClass = true, meta, meta: { error, submitError, touched, invalid }
}) {
  const { getLabel } = useContext(I18nContext);
  const errorDisplayed = displayError ? displayError(meta) : touched && invalid;

  return (
    <div
      className={classNames({
        'form-group': type !== 'hidden' || !formGroupClass,
        'has-error has-feedback': errorDisplayed && error
      })}
    >
      {label && <label htmlFor={name}>{label}</label>}
      {subLabel}
      {children}
      {errorDisplayed && (error || submitError) && <div className={`text-danger ${max && 'pull-left' || ''}`}>
        {getLabel(error || submitError)}
      </div>}
      {max && <div className={`text-right ${max - value.length < 0 && 'text-danger' || ''}`}>
        {max - value.length}
      </div>}
    </div>
  );
};

export function BasicInput({ type, placeholder, className, spellCheck, ...props }) {
  return (
    <BaseField {...props}>
      <input
        {...props.input}
        type={type}
        placeholder={placeholder}
        className={className}
        spellCheck={spellCheck}
      />
    </BaseField>
  );
}

export function BasicTextarea({ placeholder, className, rows, cols, spellCheck, ...props }) {
  return (
    <BaseField {...props}>
      <div>
        <textarea
          {...props.input}
          placeholder={placeholder}
          className={className}
          rows={rows}
          cols={cols}
          spellCheck={spellCheck}
        />
      </div>
    </BaseField>
  );
}

export function InputGroup({ type, placeholder, className, before, after, spellCheck, ...props }) {
  return (
    <BaseField {...props}>
      <div className="input-group">
        {before}
        <input
          {...props.input}
          type={type}
          placeholder={placeholder}
          className={className}
          spellCheck={spellCheck}
        />
        {after}
      </div>
    </BaseField>
  );
};

export function MarkdownInput({ placeholder, className = '', lang = 'fr', ...props }) {
  return (
    <BaseField {...props}>
      <MarkdownComponent
        {...props.input}
        placeholder={placeholder}
        className={className}
        lang={lang}
      />
    </BaseField>
  );
}
