import _ from 'lodash';
import React, {
  useCallback, useMemo, useRef, useState
} from 'react';
import { usePrevious, useIsomorphicLayoutEffect } from 'react-use';
import { useIntl } from 'react-intl';
import { useForm, Field } from 'react-final-form';
import { useMemoOne, ReactSelectField } from '@openagenda/react-shared';

import getLocalValue from '../../utils/getLocalValue';
import stateMessages from '../../utils/stateMessages';
import stringType from '../../utils/stringType';
import messages from './messages';
import Radio from './Radio';

export default ({ id, name, aggregatorAgendaSchema }) => {
  const intl = useIntl();
  const form = useForm();
  const { values, initialValues: initials } = form.getState();

  const action = useMemo(
    () => values.actions.find(v => v.id === id),
    [id, values.actions]
  );
  const fieldName = useMemoOne(() => action?.field, [action]);
  // console.log('fieldName ', fieldName);
  const prevFieldName = usePrevious(fieldName);
  const initialValues = useRef(initials).current;

  const automatic = useMemoOne(() => !!action?.automatic, [action]);
  const prevAutomatic = usePrevious(automatic);

  const initialAction = useMemo(
    () => initialValues?.actions?.find(v => v.field === fieldName),
    [fieldName, initialValues]
  );

  // console.log('aggregatorAgendaSchema.fields ', aggregatorAgendaSchema.fields);

  const textFieldOptions = aggregatorAgendaSchema.fields.filter(v => stringType.includes(v.fieldType));

  function isStringType(fieldSchema) {
    return stringType.includes(fieldSchema?.fieldType);
  }

  // console.log('textFielOptions', textFieldOptions);

  const fieldOptions = useMemoOne(
    () => aggregatorAgendaSchema.fields
      .filter(
        v => ['radio', 'checkbox'].includes(v.fieldType) && v.options?.length
      )
      .concat({
        field: 'state',
        label: intl.formatMessage(stateMessages.state),
      })
      .concat(textFieldOptions)
      .filter(
        v => v.field === fieldName
            || !values.actions.find(w => w && v.field === w.field)
      )
      .map(v => ({
        value: v.field,
        label: getLocalValue(v.label, intl.locale),
      })),
    [
      aggregatorAgendaSchema.fields,
      intl,
      fieldName,
      values.actions,
      textFieldOptions,
    ]
  );

  // console.log('fieldOptions', fieldOptions);

  const fieldSchema = useMemoOne(
    () => fieldName
      && aggregatorAgendaSchema.fields.find(v => v.field === fieldName),
    [aggregatorAgendaSchema.fields, fieldName]
  );

  // console.log('fieldSchema', fieldSchema);
  // console.log('isStringType', isStringType(fieldSchema));

  const valuesOptions = useMemoOne(() => {
    if (fieldName === 'state') {
      return [
        {
          value: 0,
          label: intl.formatMessage(stateMessages.stateToControl),
        },
        {
          value: 1,
          label: intl.formatMessage(stateMessages.stateControlled),
        },
        {
          value: 2,
          label: intl.formatMessage(stateMessages.statePublished),
        },
      ];
    }

    if (fieldSchema?.options) {
      return fieldSchema.options.map(v => ({
        value: v.id,
        label: getLocalValue(v.label, intl.locale),
      }));
    }
  }, [fieldName, fieldSchema, intl]);

  // console.log('valuesOptions', valuesOptions);

  const areAdvancedOptionsUsed = () => action?.automatic || action?.set;

  const [advancedMode, setAdvancedMode] = useState(areAdvancedOptionsUsed());
  const [valuesBeforeAutomatic, setValuesBeforeAutomatic] = useState(
    action?.values
  );

  const toggleAdvancedMode = useCallback(() => {
    setAdvancedMode(!advancedMode);
  }, [advancedMode]);

  useIsomorphicLayoutEffect(() => {
    if (automatic && !prevAutomatic) {
      setValuesBeforeAutomatic(action?.values);
      form.change(`${name}.values`, undefined);
    } else if (prevAutomatic && !automatic) {
      form.change(`${name}.values`, valuesBeforeAutomatic);
    }
  }, [automatic, prevAutomatic, action, form, name, valuesBeforeAutomatic]);

  useIsomorphicLayoutEffect(() => {
    if (prevFieldName && fieldName) {
      const haveAllOptions = []
        .concat(action?.values)
        .every(actionValue => valuesOptions?.find(v => _.isEqual(actionValue, v.value)));

      if (prevFieldName !== fieldName && !haveAllOptions) {
        setAdvancedMode(false);
        setValuesBeforeAutomatic(undefined);

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
    advancedMode,
  ]);

  const advanceModeSetField = (
    <Field
      key="set"
      component={Radio}
      name={`${name}.set`}
      initialValue={!!initialAction?.set}
      type="checkbox"
      label={intl.formatMessage(messages.clearAssignment)}
      classNameGroup="checkbox"
      helpBlock={(
        <div className="radio-sub-block text-muted">
          {intl.formatMessage(messages.clearDescription)}
        </div>
      )}
    />
  );

  return (
    <>
      <ReactSelectField
        Field={Field}
        name={`${name}.field`}
        placeholder={intl.formatMessage(messages.selectField)}
        noOptionsMessage={() => intl.formatMessage(messages.noOption)}
        options={fieldOptions}
        menuPosition="fixed"
        className="margin-bottom-xs"
        isSearchable
      />

      {valuesOptions ? (
        <>
          <ReactSelectField
            key="values"
            Field={Field}
            name={`${name}.values`}
            placeholder={intl.formatMessage(
              messages[
                action?.automatic ? 'selectValueAutomaticMode' : 'selectValue'
              ]
            )}
            noOptionsMessage={() => intl.formatMessage(messages.noOption)}
            options={valuesOptions}
            menuPosition="fixed"
            isMulti={fieldSchema?.fieldType === 'checkbox'}
            isDisabled={action?.automatic}
            initialValue={action?.values}
            isSearchable
          />
          {advancedMode ? (
            <>
              <Field
                key="automatic"
                component={Radio}
                name={`${name}.automatic`}
                initialValue={initialAction?.automatic}
                type="checkbox"
                label={intl.formatMessage(messages.automaticAssignment)}
                classNameGroup="checkbox"
                helpBlock={(
                  <div className="radio-sub-block text-muted">
                    {intl.formatMessage(messages.automaticDescription)}
                  </div>
                )}
              />
              {advanceModeSetField}
            </>
          ) : null}
        </>
      ) : null}

      {isStringType(fieldSchema) ? (
        <>
          <Field
            keys="values"
            name={`${name}.values`}
            render={({ input }) => (
              <div className="row">
                <div className="form-group form-group-v-aligned">
                  <div className="col-sm-12">
                    <input
                      type="text"
                      className="form-control"
                      {...input}
                      placeholder={fieldSchema.fieldType} // intl.formatMessage(messages.substring)
                    />
                  </div>
                </div>
              </div>
            )}
          />
          <>{advancedMode ? advanceModeSetField : null}</>
        </>
      ) : null}

      {fieldName && fieldName !== 'state' ? (
        <div className="text-right margin-top-xs">
          <button
            disabled={areAdvancedOptionsUsed()}
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
};
