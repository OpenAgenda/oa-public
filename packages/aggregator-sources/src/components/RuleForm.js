import _ from 'lodash';
import React, { useMemo, useCallback, useEffect } from 'react';
import * as ReactIs from 'react-is';
import { defineMessages, useIntl } from 'react-intl';
import { useForm, useFormState, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import ReactTagsInput from 'react-tagsinput';
import ReactSelect from 'react-select';
import { usePrevious } from 'react-use';
import classNames from 'classnames';
import { useMemoOne } from '../hooks/useMemoOne';
import getMultiLanguageLabel from '../utils/getMultiLanguageLabel';
import stateMessages from '../utils/stateMessages';
import BsField from './BsField';

const messages = defineMessages({
  addAValue: {
    id: 'aggregator-sources.RuleForm.addAValue',
    defaultMessage: 'Add a value'
  },
  noFilter: {
    id: 'aggregator-sources.RuleForm.noFilter',
    defaultMessage: 'No filter'
  },
  locationFilter: {
    id: 'aggregator-sources.RuleForm.locationFilter',
    defaultMessage: 'Location filter'
  },
  extendedFilter: {
    id: 'aggregator-sources.RuleForm.extendedFilter',
    defaultMessage: 'Additionnal field filter'
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
  type: {
    id: 'aggregator-sources.RuleForm.type',
    defaultMessage: 'Type:'
  },
  values: {
    id: 'aggregator-sources.RuleForm.values',
    defaultMessage: 'Values:'
  },
  required: {
    id: 'aggregator-sources.RuleForm.required',
    defaultMessage: 'Required:'
  },
  actions: {
    id: 'aggregator-sources.RuleForm.actions',
    defaultMessage: 'Actions:'
  },
  subdivision: {
    id: 'aggregator-sources.RuleForm.subdivision',
    defaultMessage: 'Geographical subdivision:'
  },
  selectField: {
    id: 'aggregator-sources.RuleForm.selectField',
    defaultMessage: 'Select a field'
  },
  noOption: {
    id: 'aggregator-sources.RuleForm.noOption',
    defaultMessage: 'No option'
  },
  selectValue: {
    id: 'aggregator-sources.RuleForm.selectValue',
    defaultMessage: 'Select a value'
  },
  requiredFilter: {
    id: 'aggregator-sources.RuleForm.requiredFilter',
    defaultMessage:
      'Aggregation only occurs if the event matches the criteria for this rule.'
  },
  addAnAction: {
    id: 'aggregator-sources.RuleForm.addAnAction',
    defaultMessage: 'Add an action'
  },
  removeAction: {
    id: 'aggregator-sources.RuleForm.removeAction',
    defaultMessage: 'Remove action'
  },
  actionsDescription: {
    id: 'aggregator-sources.RuleForm.actionsDescription',
    defaultMessage:
      'Select the fields to edit if the event matches the rule, and then assign them a value.'
  }
});

const selectStyles = {
  control: (provided, { isFocused }) => ({
    ...provided,
    minHeight: '35px',
    borderColor: '#cccccc',
    ...(isFocused
      ? {
        borderColor: '#66afe9',
        outline: '0',
        WebkitBoxShadow:
            'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)',
        boxShadow:
            'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)'
      }
      : {}),

    '&:hover': {
      borderColor: isFocused ? '#66afe9' : '#cccccc'
    }
  }),
  valueContainer: provided => ({
    ...provided,
    padding: '2px 4px'
  }),
  dropdownIndicator: provided => ({
    ...provided,
    padding: '5px',
    cursor: 'pointer'
  }),
  clearIndicator: provided => ({
    ...provided,
    padding: '5px',
    cursor: 'pointer'
  }),
  multiValue: provided => ({
    ...provided,
    margin: '1px',
    padding: '0px',
    borderRadius: '2px',
    overflow: 'hidden'
  }),
  multiValueLabel: provided => ({
    ...provided,
    fontSize: '100%',
    padding: '3px',
    paddingLeft: '5px',
    paddingRight: '0',
    backgroundColor: '#41acdd',
    color: '#ffffff',
    borderRadius: '0'
  }),
  multiValueRemove: provided => ({
    ...provided,
    cursor: 'pointer',
    backgroundColor: '#41acdd',
    color: '#ffffff',
    borderRadius: '0',

    '&:hover': {
      backgroundColor: '#41acdd',
      color: '#ffffff'
    }
  })
};

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

function formatTags(value) {
  return value === undefined ? [] : value;
}

function parseTags(tags) {
  return tags.length ? tags : undefined;
}

function TagsInput({
  input, meta, placeholder, ...props
}) {
  const inputProps = useMemo(() => {
    const hasValue = input.value && input.value.length;

    return {
      placeholder,
      title: hasValue ? placeholder : undefined,
      style: hasValue
        ? {}
        : {
          width: '100%'
        }
    };
  }, [placeholder, input.value]);

  return (
    <>
      <ReactTagsInput {...input} {...props} inputProps={inputProps} />

      {!meta.dirtySinceLastSubmit && meta.submitError ? (
        <div className="margin-top-xs margin-bottom-sm text-danger">
          {meta.submitError}
        </div>
      ) : null}
    </>
  );
}

function ReactSelectInput({ input, meta, ...rest }) {
  return (
    <>
      <ReactSelect {...input} {...rest} />

      {!meta.dirtySinceLastSubmit && meta.submitError ? (
        <div className="margin-top-xs margin-bottom-sm text-danger">
          {meta.submitError}
        </div>
      ) : null}
    </>
  );
}

function Select({
  input,
  meta,
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
    <BsField input={input} meta={meta} {...props}>
      <select {...input} {...inputAttrs}>
        {children}
      </select>

      {!meta.dirtySinceLastSubmit && meta.submitError ? (
        <div className="margin-top-xs margin-bottom-sm text-danger">
          {meta.submitError}
        </div>
      ) : null}
    </BsField>
  );
}

function Radio({
  id,
  input,
  meta,
  label,
  placeholder,
  className,
  spellCheck,
  autoFocus,
  disabled,
  ...props
}) {
  const inputAttrs = useMemo(
    () => ({
      id,
      placeholder,
      className,
      spellCheck,
      autoFocus,
      disabled
    }),
    [id, placeholder, className, spellCheck, autoFocus, disabled]
  );

  return (
    <BsField input={input} meta={meta} {...props}>
      <label htmlFor={id}>
        <input {...input} {...inputAttrs} /> {label}
      </label>
    </BsField>
  );
}

function LocationFormPart() {
  const intl = useIntl();

  return (
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
          <label className="control-label col-sm-2" htmlFor="values">
            {intl.formatMessage(messages.values)}
          </label>

          <div className="col-sm-10">
            <Field
              component={TagsInput}
              name="values"
              className="form-control react-tagsinput"
              classNameGroup="form-inline"
              placeholder={intl.formatMessage(messages.addAValue)}
              format={formatTags}
              parse={parseTags}
              addOnBlur
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* function ExtendedFormPart({ aggregatorSchema, sourceSchema }) {
  const intl = useIntl();

  const options = useMemoOne(
    () => sourceSchema.fields.map(({ field, label }) => ({
      value: field,
      label: getMultiLanguageLabel(label, intl.locale)
    })),
    [sourceSchema]
  );

  const { values } = useFormState({
    subscription: {
      values: true
    }
  });

  const field = useMemoOne(
    () => sourceSchema.fields.find(v => values?.field?.value && v.field === values.field?.value),
    [values.field]
  );

  return (
    <>
      <Field
        component={ReactSelectInput}
        name="field"
        className="form-group"
        placeholder={intl.formatMessage(messages.selectField)}
        noOptionsMessage={() => intl.formatMessage(messages.noOption)}
        options={options}
        menuPosition="fixed"
        isSearchable
      />

      {values.field ? (
        <p>Un truc</p>
      ) : null}
    </>
  );
} */

function TagsFormPart() {
  const intl = useIntl();

  return (
    <div className="form-group form-group-values">
      <div className="row">
        <label className="control-label col-sm-2" htmlFor="values">
          {intl.formatMessage(messages.values)}
        </label>

        <div className="col-sm-10">
          <Field
            component={TagsInput}
            name="values"
            className="form-control react-tagsinput"
            classNameGroup="form-inline"
            placeholder={intl.formatMessage(messages.addAValue)}
            format={formatTags}
            parse={parseTags}
            addOnBlur
          />
        </div>
      </div>
    </div>
  );
}

function ActionFormPart({ name, aggregatorSchema }) {
  const form = useForm();
  const formState = useFormState();
  const intl = useIntl();

  const { values } = formState;

  const fieldName = useMemoOne(() => _.get(values, name)?.field?.value, [
    values,
    name
  ]);

  const fieldOptions = useMemoOne(
    () => aggregatorSchema.fields
      .filter(
        v => ['radio', 'checkbox'].includes(v.fieldType) && v.options?.length
      )
      .concat({
        field: 'state',
        label: intl.formatMessage(stateMessages.state)
      })
      .filter(
        v => v.field === fieldName
            || !values.actions.find(w => w && v.field === w.field.value)
      )
      .map(v => ({
        value: v.field,
        label: getMultiLanguageLabel(v.label, intl.locale)
      })),
    [aggregatorSchema.fields]
  );

  const prevFieldName = usePrevious(fieldName);

  const fieldSchema = useMemoOne(
    () => fieldName && aggregatorSchema.fields.find(v => v.field === fieldName),
    [aggregatorSchema.fields, fieldName]
  );
  const valuesOptions = useMemoOne(() => {
    if (fieldName === 'state') {
      return [
        {
          value: 0,
          label: intl.formatMessage(stateMessages.stateToControl)
        },
        {
          value: 1,
          label: intl.formatMessage(stateMessages.stateControlled)
        },
        {
          value: 2,
          label: intl.formatMessage(stateMessages.statePublished)
        }
      ];
    }

    if (fieldSchema?.options) {
      return fieldSchema.options.map(v => ({
        value: v.id,
        label: getMultiLanguageLabel(v.label, intl.locale)
      }));
    }
  });

  useEffect(() => {
    if (prevFieldName && fieldName && prevFieldName !== fieldName) {
      form.change(`${name}.values`, '');
    }
  }, [prevFieldName, fieldName, name, form]);

  return (
    <>
      <Field
        component={ReactSelectInput}
        name={`${name}.field`}
        placeholder={intl.formatMessage(messages.selectField)}
        noOptionsMessage={() => intl.formatMessage(messages.noOption)}
        options={fieldOptions}
        menuPosition="fixed"
        className="margin-bottom-xs"
        styles={selectStyles}
        isSearchable
      />

      {valuesOptions ? (
        <Field
          component={ReactSelectInput}
          name={`${name}.values`}
          placeholder={intl.formatMessage(messages.selectValue)}
          noOptionsMessage={() => intl.formatMessage(messages.noOption)}
          options={valuesOptions}
          menuPosition="fixed"
          styles={selectStyles}
          isMulti={fieldSchema?.fieldType === 'checkbox'}
          isSearchable
        />
      ) : null}
    </>
  );
}

function ActionsFormPart({ aggregatorSchema }) {
  const intl = useIntl();
  const form = useForm();
  const { values } = useFormState();

  const leftFieldsToDefine = useMemo(
    () => aggregatorSchema.fields
      .filter(
        v => ['radio', 'checkbox'].includes(v.fieldType) && v.options?.length
      )
      .concat({ field: 'state' })
      .filter(v => !values.actions?.find(w => w && v.field === w.field.value))
      .length,
    [aggregatorSchema.fields, values.actions]
  );

  const lastAction = useMemo(
    () => (values.actions ? values.actions[values.actions.length - 1] : null),
    [values.actions]
  );

  const pushAction = useCallback(() => {
    if (leftFieldsToDefine && (lastAction === null || lastAction?.field)) {
      form.mutators.push('actions');
    }
  }, [form.mutators, lastAction, leftFieldsToDefine]);

  if (!values.type) {
    return null;
  }

  return (
    <div className="form-group">
      <div className="row">
        <span className="control-label col-sm-2">
          <b>{intl.formatMessage(messages.actions)}</b>
        </span>

        <div className="col-sm-10">
          <p>{intl.formatMessage(messages.actionsDescription)}</p>

          <FieldArray name="actions">
            {({ fields }) => fields.map((name, index) => (
              <div key={name} className="margin-top-sm actions-container">
                <div className="form-group">
                  <ActionFormPart
                    name={name}
                    aggregatorSchema={aggregatorSchema}
                  />
                </div>

                <div className="remove-action">
                  <button
                    type="button"
                    className="btn btn-link-inline"
                    onClick={() => fields.remove(index)}
                    title={intl.formatMessage(messages.removeAction)}
                  >
                    <i
                      className="fa fa-times text-danger"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            ))}
          </FieldArray>

          <button
            type="button"
            className="btn btn-link-inline"
            onClick={pushAction}
          >
            {intl.formatMessage(messages.addAnAction)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RuleForm({
  SubmitButton,
  handleSubmit,
  onCancel,
  values,
  options,
  disabledExtended,
  aggregatorSchema,
  sourceSchema
}) {
  const intl = useIntl();
  const formState = useFormState();

  const error = !formState.dirtySinceLastSubmit && formState.submitError
    ? formState.submitError
    : null;

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
            {intl.formatMessage(messages.type)}
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
              label={intl.formatMessage(messages.extendedFilter)}
              value="extended"
              classNameGroup={classNames('radio', {
                disabled: disabledExtended
              })}
              disabled={disabledExtended}
            />
            <Field
              component={Radio}
              name="type"
              type="radio"
              label={intl.formatMessage(messages.tagFilter)}
              value="tags"
              classNameGroup="radio"
            />
            <Field
              component={Radio}
              name="type"
              type="radio"
              label={intl.formatMessage(messages.noFilter)}
              value="all"
              classNameGroup="radio"
            />

            {!formState.dirtySinceLastSubmit && formState.submitErrors?.type ? (
              <div className="margin-top-xs margin-bottom-md text-danger">
                {formState.submitErrors?.type}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {values.type === 'location' ? <LocationFormPart /> : null}
      {/* values.type === 'extended' ? (
        <ExtendedFormPart
          aggregatorSchema={aggregatorSchema}
          sourceSchema={sourceSchema}
        />
      ) : null */}
      {values.type === 'tags' ? <TagsFormPart /> : null}

      {values.type ? (
        <div className="row checkbox">
          <div className="col-sm-2">
            <b>{intl.formatMessage(messages.required)}</b>
          </div>
          <div className="col-sm-10">
            <div className="form-group">
              <Field
                component={Radio}
                name="required"
                type="checkbox"
                label={intl.formatMessage(messages.requiredFilter)}
                defaultValue // true
              />
            </div>
          </div>
        </div>
      ) : null}

      <ActionsFormPart
        aggregatorSchema={aggregatorSchema}
        sourceSchema={sourceSchema}
      />

      {error ? <p className="text-danger">{error}</p> : null}

      {submitElement}
    </form>
  );
}
