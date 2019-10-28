import React, { useMemo } from 'react';
import * as ReactIs from 'react-is';
import { defineMessages, useIntl } from 'react-intl';
import { useFormState, Field } from 'react-final-form';
import ReactTagsInput from 'react-tagsinput';
import BsField from './BsField';

const messages = defineMessages({
  addAValue: {
    id: 'aggregator-sources.RuleForm.addAValue',
    defaultMessage: 'Add a value'
  },
  locationFilter: {
    id: 'aggregator-sources.RuleForm.locationFilter',
    defaultMessage: 'Location filter'
  },
  tagFilter: {
    id: 'aggregator-sources.RuleForm.tagFilter',
    defaultMessage: 'Tag filter'
  },
  city: {
    id: 'aggregator-sources.RuleForm.city',
    defaultMessage: 'City'
  },
  department: {
    id: 'aggregator-sources.RuleForm.department',
    defaultMessage: 'Department'
  },
  region: {
    id: 'aggregator-sources.RuleForm.region',
    defaultMessage: 'Region'
  },
  values: {
    id: 'aggregator-sources.RuleForm.values',
    defaultMessage: 'Values:'
  },
  subdivision: {
    id: 'aggregator-sources.RuleForm.subdivision',
    defaultMessage: 'Geographical subdivision:'
  }
});

// function Input({
//   input,
//   placeholder,
//   className,
//   spellCheck,
//   autoFocus,
//   ...props
// }) {
//   const inputAttrs = {
//     className,
//     placeholder,
//     spellCheck,
//     autoFocus
//   };
//
//   return (
//     <BsField input={input} {...props}>
//       <input {...input} {...inputAttrs} />
//     </BsField>
//   );
// }

function TagsInput({
  input, placeholder, className, spellCheck, autoFocus
}) {
  const inputAttrs = {
    className,
    spellCheck,
    autoFocus
  };

  const inputProps = useMemo(
    () => ({
      placeholder
    }),
    [placeholder]
  );

  return <ReactTagsInput {...input} {...inputAttrs} inputProps={inputProps} />;
}

function Select({
  input,
  placeholder,
  className,
  spellCheck,
  autoFocus,
  children,
  ...props
}) {
  const inputAttrs = useMemo(
    () => ({
      placeholder,
      className,
      spellCheck,
      autoFocus
    }),
    [placeholder, className, spellCheck, autoFocus]
  );

  return (
    <BsField input={input} {...props}>
      <select {...input} {...inputAttrs}>
        {children}
      </select>
    </BsField>
  );
}

function Radio({
  id,
  input,
  label,
  placeholder,
  className,
  spellCheck,
  autoFocus,
  ...props
}) {
  const inputAttrs = useMemo(
    () => ({
      id,
      placeholder,
      className,
      spellCheck,
      autoFocus
    }),
    [id, placeholder, className, spellCheck, autoFocus]
  );

  return (
    <BsField input={input} {...props}>
      <label htmlFor={id}>
        <input {...input} {...inputAttrs} /> {label}
      </label>
    </BsField>
  );
}

export default function RuleForm({
  SubmitButton,
  handleSubmit,
  onCancel,
  values,
  options
}) {
  const intl = useIntl();
  const formState = useFormState();

  const error = formState.submitError && !formState.dirtySinceLastSubmit
    ? formState.submitError
    : null;

  const locationFormPart = (
    <>
      <Field
        component={Select}
        name="subdivision"
        defaultValue="city"
        label={intl.formatMessage(messages.subdivision)}
        subLabel=" "
        className="form-control"
        classNameGroup="form-group form-inline"
      >
        <option value="city">{intl.formatMessage(messages.city)}</option>
        <option value="department">
          {intl.formatMessage(messages.department)}
        </option>
        <option value="region">{intl.formatMessage(messages.region)}</option>
      </Field>

      <div className="form-group form-group-values">
        <div className="row">
          <label className="control-label col-sm-2" htmlFor="type">
            {intl.formatMessage(messages.values)}
          </label>

          <div className="col-sm-10">
            <Field
              component={TagsInput}
              name="values"
              className="form-control react-tagsinput"
              classNameGroup="form-inline"
              placeholder={intl.formatMessage(messages.addAValue)}
              format={v => (v === undefined ? [] : v)}
              parse={v => (v.length ? v : undefined)}
            />
          </div>
        </div>
      </div>
    </>
  );

  const tagsFormPart = (
    <div className="form-group form-group-values">
      <div className="row">
        <label className="control-label col-sm-2" htmlFor="type">
          {intl.formatMessage(messages.values)}
        </label>

        <div className="col-sm-10">
          <Field
            component={TagsInput}
            name="values"
            className="form-control react-tagsinput"
            classNameGroup="form-inline"
            placeholder={intl.formatMessage(messages.addAValue)}
            format={v => (v === undefined ? [] : v)}
            parse={v => (v.length ? v : undefined)}
          />
        </div>
      </div>
    </div>
  );

  const submitElement = useMemo(
    () => (ReactIs.isValidElementType(SubmitButton) ? (
      <SubmitButton
        handleSubmit={handleSubmit}
        onCancel={onCancel}
        options={options}
      />
    ) : null),
    [SubmitButton, handleSubmit, onCancel, options]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group form-group-type">
        <div className="row">
          <label className="control-label col-sm-2" htmlFor="type">
            Type:
          </label>

          <div className="col-sm-10">
            <Field
              component={Radio}
              name="type"
              type="radio"
              label={intl.formatMessage(messages.locationFilter)}
              value="location"
              classNameGroup="radio"
            />
            <Field
              component={Radio}
              name="type"
              type="radio"
              label={intl.formatMessage(messages.tagFilter)}
              value="tags"
              classNameGroup="radio"
            />
          </div>
        </div>
      </div>

      {values.type === 'location' ? locationFormPart : null}
      {values.type === 'tags' ? tagsFormPart : null}

      {error ? <p className="text-danger">{error}</p> : null}

      {submitElement}
    </form>
  );
}
