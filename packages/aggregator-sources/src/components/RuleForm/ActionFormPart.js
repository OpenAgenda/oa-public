import { useCallback, useMemo, useRef, useState } from 'react';
import { usePrevious, useIsomorphicLayoutEffect } from 'react-use';
import { useIntl } from 'react-intl';
import { useForm, Field } from 'react-final-form';

import { getLocaleValue } from '@openagenda/intl';
import { useMemoOne, ReactSelectField } from '@openagenda/react-shared';
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
    [id, values.actions],
  );
  const fieldName = useMemoOne(() => action?.field, [action]);
  const prevFieldName = usePrevious(fieldName);
  const initialValues = useRef(initials).current;

  const automatic = useMemoOne(() => !!action?.automatic, [action]);
  const prevAutomatic = usePrevious(automatic);
  const [initialAction] = useState(() =>
    initialValues?.actions?.find(v => v.field === fieldName));
  const textFieldOptions = aggregatorAgendaSchema.fields.filter(v =>
    stringType.includes(v.fieldType));

  function isStringType(fieldSchema) {
    return stringType.includes(fieldSchema?.fieldType);
  }

  const fieldOptions = useMemoOne(
    () =>
      aggregatorAgendaSchema.fields
        .filter(
          v =>
            ['radio', 'checkbox', 'select', 'multiselect'].includes(
              v.fieldType,
            ) && v.options?.length,
        )
        .concat({
          field: 'state',
          label: intl.formatMessage(stateMessages.state),
        })
        .concat(textFieldOptions)
        .filter(
          v =>
            v.field === fieldName
            || !values.actions.find(w => w && v.field === w.field),
        )
        .map(v => ({
          value: v.field,
          label: getLocaleValue(v.label, intl.locale),
        })),
    [
      aggregatorAgendaSchema.fields,
      intl,
      fieldName,
      values.actions,
      textFieldOptions,
    ],
  );

  const fieldSchema = useMemoOne(
    () =>
      fieldName
      && aggregatorAgendaSchema.fields.find(v => v.field === fieldName),
    [aggregatorAgendaSchema.fields, fieldName],
  );
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
        label: getLocaleValue(v.label, intl.locale),
      }));
    }
  }, [fieldName, fieldSchema, intl]);
  const areAdvancedOptionsUsed = () => action?.automatic || action?.set;

  const [advancedMode, setAdvancedMode] = useState(areAdvancedOptionsUsed());
  const [valuesBeforeAutomatic, setValuesBeforeAutomatic] = useState(
    action?.values,
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
        onChange={e => {
          if (prevFieldName !== e.value) {
            form.batch(() => {
              form.change(`${name}.field`, e.value);
              form.change(`${name}.values`, undefined);
              form.change(`${name}.automatic`, undefined);
            });
            setAdvancedMode(false);
            setValuesBeforeAutomatic(undefined);
          } else {
            form.change(`${name}.field`, e.value);
          }
        }}
      />

      {valuesOptions ? (
        <>
          <ReactSelectField
            key={`${name}-values-${action.field}`}
            Field={Field}
            name={`${name}.values`}
            placeholder={intl.formatMessage(
              messages[
                action?.automatic ? 'selectValueAutomaticMode' : 'selectValue'
              ],
            )}
            noOptionsMessage={() => intl.formatMessage(messages.noOption)}
            options={valuesOptions}
            menuPosition="fixed"
            isMulti={fieldSchema?.fieldType === 'checkbox'}
            isDisabled={action?.automatic}
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
            key={`${name}-values-${action.field}`}
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
          {advancedMode ? advanceModeSetField : null}
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
