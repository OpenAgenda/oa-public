import { useCallback, useMemo, useRef, useState } from 'react';
import useIsomorphicLayoutEffectModule from 'react-use/lib/useIsomorphicLayoutEffect.js';
import usePreviousModule from 'react-use/lib/usePrevious.js';
import { useIntl } from 'react-intl';
import { useForm, Field } from 'react-final-form';

import { getLocaleValue } from '@openagenda/intl';
import { useMemoOne, ReactSelectField } from '@openagenda/react-shared';
import stateMessages from '../../utils/stateMessages.js';
import stringType from '../../utils/stringType.js';
import isOptionedField from '../../utils/isOptionedField.js';
import messages from './messages.js';
import Radio from './Radio.js';
import TextFieldActionForm from './TextFieldActionForm.js';

const useIsomorphicLayoutEffect = useIsomorphicLayoutEffectModule.default || useIsomorphicLayoutEffectModule;
const usePrevious = usePreviousModule.default || usePreviousModule;

const isMultiLang = (field) => !!field.languages;

export default ({ id, name, aggregatorAgendaSchema, sourceSchema }) => {
  const intl = useIntl();
  const form = useForm();
  const { values, initialValues: initials } = form.getState();

  const action = useMemo(
    () => values.actions.find((v) => v.id === id),
    [id, values.actions],
  );
  const fieldName = useMemoOne(() => action?.field, [action]);
  const prevFieldName = usePrevious(fieldName);
  const initialValues = useRef(initials).current;

  const automatic = useMemoOne(() => !!action?.automatic, [action]);
  const prevAutomatic = usePrevious(automatic);
  const [initialAction] = useState(() =>
    initialValues?.actions?.find((v) => v.field === fieldName));
  const textFieldOptions = aggregatorAgendaSchema.fields.filter(
    (v) => stringType.includes(v.fieldType) && !isMultiLang(v),
  );

  const textFieldCopyOptions = (sourceSchema?.fields ?? [])
    .filter((v) => stringType.includes(v.fieldType))
    .map((f) => ({ value: f.field, label: f.label[intl.locale] || f.label }));

  function isStringType(fieldSchema) {
    return stringType.includes(fieldSchema?.fieldType);
  }

  const fieldOptions = useMemoOne(
    () =>
      aggregatorAgendaSchema.fields
        .filter(isOptionedField)
        .concat({
          field: 'state',
          label: intl.formatMessage(stateMessages.state),
        })
        .concat(textFieldOptions)
        .filter(
          (v) =>
            v.field === fieldName
            || !values.actions.find((w) => w && v.field === w.field),
        )
        .map((v) => ({
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
      && aggregatorAgendaSchema.fields.find((v) => v.field === fieldName),
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
      return fieldSchema.options.map((v) => ({
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
        onChange={(e) => {
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
            isMulti={isOptionedField.multi(fieldSchema)}
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
        <TextFieldActionForm
          name={name}
          action={action}
          fieldSchema={fieldSchema}
          textFieldCopyOptions={textFieldCopyOptions}
          advancedMode={advancedMode}
          advanceModeSetField={advanceModeSetField}
        />
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
