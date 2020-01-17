import _ from 'lodash';
import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useLayoutEffect,
  useRef
} from 'react';
import * as ReactIs from 'react-is';
import { defineMessages, useIntl } from 'react-intl';
import { useForm, useFormState, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { usePrevious } from 'react-use';
import classNames from 'classnames';
import {
  useMemoOne,
  useCallbackOne
} from '@openagenda/react-shared/dist/hooks/useMemoOne';
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
  field: {
    id: 'aggregator-sources.RuleForm.field',
    defaultMessage: 'Field:'
  },
  selectField: {
    id: 'aggregator-sources.RuleForm.selectField',
    defaultMessage: 'Select a field'
  },
  noOption: {
    id: 'aggregator-sources.RuleForm.noOption',
    defaultMessage: 'No option'
  },
  createOption: {
    id: 'aggregator-sources.RuleForm.createOption',
    defaultMessage: 'Add value {value}'
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
  },
  helpFilterLocation: {
    id: 'aggregator-sources.RuleForm.helpFilterLocation',
    defaultMessage:
      'Apply the rule to events corresponding to one or more cities, departments or regions.'
  },
  helpFilterExtended: {
    id: 'aggregator-sources.RuleForm.helpFilterExtended',
    defaultMessage:
      'Apply the rule to events corresponding to one or more values coming from additional fields of the source.'
  },
  helpFilterTag: {
    id: 'aggregator-sources.RuleForm.helpFilterTag',
    defaultMessage:
      'Apply the rule to events associated with optional values whose labels correspond.'
  },
  automaticAssignment: {
    id: 'aggregator-sources.RuleForm.automaticAssignment',
    defaultMessage: 'Automatic assignment'
  },
  automaticDescription: {
    id: 'aggregator-sources.RuleForm.automaticDescription',
    defaultMessage:
      'The values of the field will be defined automatically according to the values read from the source.'
  },
  modeSimple: {
    id: 'aggregator-sources.RuleForm.modeSimple',
    defaultMessage: 'Simple mode'
  },
  modeAdvanced: {
    id: 'aggregator-sources.RuleForm.modeAdvanced',
    defaultMessage: 'Advanced mode'
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

function ReactSelectInput({
  innerRef, creatable, input, meta, ...rest
}) {
  const SelectComponent = creatable ? CreatableSelect : ReactSelect;

  return (
    <>
      <SelectComponent ref={innerRef} {...input} {...rest} />

      {!meta.dirtySinceLastSubmit && meta.submitError ? (
        <div className="margin-top-xs margin-bottom-sm text-danger">
          {meta.submitError}
        </div>
      ) : null}
    </>
  );
}

function SelectField({
  name,
  initialValue,
  options,
  creatable,
  onBlur,
  ...props
}) {
  const intl = useIntl();
  const selectRef = useRef(null);

  const format = useCallback(
    selectedOption => {
      if (selectedOption === null) {
        return null;
      }

      if ([undefined, ''].includes(selectedOption)) {
        return undefined;
      }

      const findOption = opt => options?.find(v => v.value === opt) ?? { label: opt, value: opt };

      return Array.isArray(selectedOption)
        ? selectedOption.map(findOption)
        : findOption(selectedOption);
    },
    [options]
  );
  const parse = useCallback(value => {
    if (value === '') {
      return undefined;
    }

    const getValue = arg => arg?.value ?? arg;

    return Array.isArray(value) ? value.map(getValue) : getValue(value);
  }, []);
  const formatCreateLabel = useCallback(
    value => intl.formatMessage(messages.createOption, { value }),
    [intl]
  );
  const handleBlur = useCallback(
    (...args) => {
      if (creatable) {
        const {
          state: { inputValue, value }
        } = selectRef.current;

        const alreadyInValue = inputValue.length
          ? value.some(v => v.value === inputValue)
          : true;

        if (!alreadyInValue) {
          selectRef.current.onChange([
            ...value,
            { label: inputValue, value: inputValue }
          ]);
        }
      }

      if (typeof onBlur === 'function') {
        return onBlur(...args);
      }
    },
    [onBlur, creatable]
  );
  const isValidNewOption = useCallback(
    value => ![undefined, null, ''].includes(value),
    []
  );

  const initialOption = useMemo(() => initialValue ?? format(initialValue), [
    format,
    initialValue
  ]);

  return (
    <Field
      name={name}
      innerRef={selectRef}
      component={ReactSelectInput}
      options={options}
      initialValue={initialOption}
      creatable={creatable}
      format={format}
      parse={parse}
      formatCreateLabel={formatCreateLabel}
      onBlur={handleBlur}
      isValidNewOption={creatable ? isValidNewOption : undefined}
      {...props}
    />
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
  helpBlock,
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
      {ReactIs.isElement(helpBlock) ? helpBlock : null}
    </BsField>
  );
}

function LocationFormPart() {
  const intl = useIntl();
  const { initialValues } = useFormState();

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

      <div className="row">
        <div className="form-group form-group-v-aligned">
          <label className="control-label col-sm-2" htmlFor="locationValues">
            {intl.formatMessage(messages.values)}
          </label>

          <div className="col-sm-10">
            <SelectField
              name="locationValues"
              placeholder={intl.formatMessage(messages.addAValue)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              menuPosition="fixed"
              styles={selectStyles}
              initialValue={initialValues?.locationValues}
              isMulti
              creatable
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ExtendedFormPart({ sourceSchema }) {
  const intl = useIntl();
  const form = useForm();
  const { values, initialValues } = form.getState();

  const options = useMemoOne(
    () => sourceSchema.fields
      .filter(v => ['radio', 'checkbox'].includes(v.fieldType))
      .map(({ field, label }) => ({
        value: field,
        label: getMultiLanguageLabel(label, intl.locale)
      })),
    [sourceSchema]
  );

  const fieldName = useMemoOne(() => values.field, [values]);
  const prevFieldName = usePrevious(fieldName);

  const fieldSchema = useMemoOne(
    () => sourceSchema.fields.find(v => v.field === fieldName),
    []
  );

  useEffect(() => {
    if (prevFieldName && fieldName && prevFieldName !== fieldName) {
      form.change('extendedValues', null);
    }
  }, [prevFieldName, fieldName, form]);

  const valuesOptions = useMemoOne(() => {
    if (fieldSchema?.options) {
      return fieldSchema.options.map(v => ({
        value: v.id,
        label: getMultiLanguageLabel(v.label, intl.locale)
      }));
    }
  }, [fieldSchema]);

  return (
    <>
      <div className="row">
        <div className="form-group form-group-v-aligned">
          <label className="control-label col-sm-2" htmlFor="field">
            {intl.formatMessage(messages.field)}
          </label>

          <div className="col-sm-10">
            <SelectField
              name="field"
              placeholder={intl.formatMessage(messages.selectField)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              options={options}
              menuPosition="fixed"
              styles={selectStyles}
              isSearchable
              initialValue={initialValues?.field}
            />
          </div>
        </div>
      </div>

      {values.field ? (
        <div className="row">
          <div className="form-group form-group-v-aligned">
            <label className="control-label col-sm-2" htmlFor="extendedValues">
              {intl.formatMessage(messages.values)}
            </label>

            <div className="col-sm-10">
              <SelectField
                name="extendedValues"
                initialValue={
                  values.field !== undefined
                  && values.field === initialValues?.field
                    ? initialValues?.extendedValues
                    : undefined
                }
                placeholder={intl.formatMessage(messages.selectValue)}
                noOptionsMessage={() => intl.formatMessage(messages.noOption)}
                options={valuesOptions}
                menuPosition="fixed"
                styles={selectStyles}
                isMulti={fieldSchema?.fieldType === 'checkbox'}
                isSearchable
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function TagsFormPart({ schema }) {
  const intl = useIntl();
  const { initialValues } = useFormState();

  const options = useMemoOne(
    () => (schema
      ? schema.fields
        .filter(v => ['radio', 'checkbox'].includes(v.fieldType))
        .map(({ options: fieldOptions }) => fieldOptions)
        .flat()
        .map(v => ({
          value: v.label,
          label: getMultiLanguageLabel(v.label)
        }))
      : []),
    [schema]
  );

  return (
    <div className="row">
      <div className="form-group form-group-v-aligned">
        <label className="control-label col-sm-2" htmlFor="tagValues">
          {intl.formatMessage(messages.values)}
        </label>

        <div className="col-sm-10">
          <SelectField
            name="tagValues"
            initialValue={initialValues?.tagValues}
            placeholder={intl.formatMessage(messages.addAValue)}
            noOptionsMessage={() => intl.formatMessage(messages.noOption)}
            options={options}
            menuPosition="fixed"
            styles={selectStyles}
            isMulti
            creatable
          />
        </div>
      </div>
    </div>
  );
}

function ActionFormPart({ id, name, aggregatorAgendaSchema }) {
  const intl = useIntl();
  const form = useForm();
  const { values, initialValues: initials } = form.getState();

  const action = useMemo(() => values.actions.find(v => v.id === id), [
    id,
    values.actions
  ]);
  const fieldName = useMemoOne(() => action?.field, [values, name]);
  const prevFieldName = usePrevious(fieldName);
  const initialValues = useRef(initials).current;

  const initialAction = useMemo(
    () => initialValues?.actions?.find(v => v.field === fieldName),
    [fieldName, initialValues]
  );

  const fieldOptions = useMemoOne(
    () => aggregatorAgendaSchema.fields
      .filter(
        v => ['radio', 'checkbox'].includes(v.fieldType) && v.options?.length
      )
      .concat({
        field: 'state',
        label: intl.formatMessage(stateMessages.state)
      })
      .filter(
        v => v.field === fieldName
            || !values.actions.find(w => w && v.field === w.field)
      )
      .map(v => ({
        value: v.field,
        label: getMultiLanguageLabel(v.label, intl.locale)
      })),
    [aggregatorAgendaSchema.fields, values.actions, intl]
  );

  const fieldSchema = useMemoOne(
    () => fieldName
      && aggregatorAgendaSchema.fields.find(v => v.field === fieldName),
    [aggregatorAgendaSchema.fields, fieldName]
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
  }, [fieldName, fieldSchema, intl]);

  const [advancedMode, setAdvancedMode] = useState(action?.automatic);
  const [valuesBeforeAdvanced, setValuesBeforeAdvanced] = useState(
    action?.values
  );
  const toggleAdvancedMode = useCallback(() => {
    if (!advancedMode) {
      setValuesBeforeAdvanced(action?.values);
      form.change(`${name}.values`, undefined);
    } else {
      form.change(`${name}.automatic`, undefined);
    }

    setAdvancedMode(!advancedMode);
  }, [action, advancedMode, form, name]);

  useLayoutEffect(() => {
    if (prevFieldName && fieldName) {
      const haveAllOptions = []
        .concat(action?.values)
        .every(actionValue => valuesOptions?.find(v => _.isEqual(actionValue, v.value)));

      if (prevFieldName !== fieldName && !haveAllOptions) {
        setAdvancedMode(false);
        setValuesBeforeAdvanced(undefined);

        form.batch(() => {
          form.change(`${name}.values`, undefined);
          form.change(`${name}.automatic`, undefined);
        });
      }
    }
  }, [
    action,
    fieldName,
    form,
    name,
    prevFieldName,
    valuesOptions,
    advancedMode
  ]);

  return (
    <>
      <SelectField
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
        <>
          {advancedMode ? (
            <Field
              key="automatic"
              component={Radio}
              name={`${name}.automatic`}
              initialValue={initialAction?.automatic ?? true}
              defaultValue // true
              type="checkbox"
              label={intl.formatMessage(messages.automaticAssignment)}
              classNameGroup="checkbox"
              helpBlock={(
                <div className="radio-help-block text-muted">
                  {intl.formatMessage(messages.automaticDescription)}
                </div>
              )}
            />
          ) : (
            <SelectField
              key="values"
              name={`${name}.values`}
              placeholder={intl.formatMessage(messages.selectValue)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              options={valuesOptions}
              menuPosition="fixed"
              styles={selectStyles}
              isMulti={fieldSchema?.fieldType === 'checkbox'}
              initialValue={valuesBeforeAdvanced}
              isSearchable
            />
          )}
        </>
      ) : null}

      {fieldName && fieldName !== 'state' ? (
        <div className="text-right margin-top-xs">
          <button
            onClick={toggleAdvancedMode}
            type="button"
            className="btn btn-link-inline"
          >
            {advancedMode
              ? intl.formatMessage(messages.modeSimple)
              : intl.formatMessage(messages.modeAdvanced)}
          </button>
        </div>
      ) : null}
    </>
  );
}

function ActionsFormPart({ aggregatorAgendaSchema }) {
  const intl = useIntl();
  const form = useForm();
  const { values } = form.getState();

  const leftFieldsToDefine = useMemoOne(
    () => aggregatorAgendaSchema.fields
      .filter(
        v => ['radio', 'checkbox'].includes(v.fieldType) && v.options?.length
      )
      .concat({ field: 'state' })
      .filter(v => !values.actions?.find(w => w && v.field === w.field))
      .length,
    [aggregatorAgendaSchema.fields, values.actions]
  );

  const lastAction = useMemoOne(
    () => (values.actions ? values.actions[values.actions.length - 1] : null),
    [values.actions]
  );

  const pushAction = useCallbackOne(() => {
    if (
      leftFieldsToDefine
      && (!values.actions?.length || (lastAction && lastAction.field))
    ) {
      form.mutators.push('actions', { id: _.uniqueId(), field: null });
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
              <div
                key={values.actions[index].id}
                className="margin-top-sm actions-container"
              >
                <div className="form-group">
                  <ActionFormPart
                    id={values.actions[index].id}
                    name={name}
                    aggregatorAgendaSchema={aggregatorAgendaSchema}
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
  isAggregator,
  aggregatorAgendaSchema,
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
      <div className="row">
        <div className="form-group form-group-v-aligned">
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
              helpBlock={(
                <div className="radio-help-block text-muted">
                  {intl.formatMessage(messages.helpFilterLocation)}
                </div>
              )}
            />

            {isAggregator ? (
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
                helpBlock={(
                  <div className="radio-help-block text-muted">
                    {intl.formatMessage(messages.helpFilterExtended)}
                  </div>
                )}
              />
            ) : null}

            <Field
              component={Radio}
              name="type"
              type="radio"
              label={intl.formatMessage(messages.tagFilter)}
              value="tags"
              classNameGroup="radio"
              helpBlock={(
                <div className="radio-help-block text-muted">
                  {intl.formatMessage(messages.helpFilterTag)}
                </div>
              )}
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
                {formState.submitErrors.type}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {values.type === 'location' ? <LocationFormPart /> : null}
      {values.type === 'extended' ? (
        <ExtendedFormPart
          aggregatorAgendaSchema={aggregatorAgendaSchema}
          sourceSchema={sourceSchema}
        />
      ) : null}
      {values.type === 'tags' ? <TagsFormPart schema={sourceSchema} /> : null}

      {values.type ? (
        <>
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

          <ActionsFormPart
            aggregatorAgendaSchema={aggregatorAgendaSchema}
            sourceSchema={sourceSchema}
          />
        </>
      ) : null}

      {error ? <p className="text-danger">{error}</p> : null}

      {submitElement}
    </form>
  );
}
