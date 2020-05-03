import _ from 'lodash';
import React, {
  useCallback, useMemo, useRef, useState
} from 'react';
import { usePrevious, useIsomorphicLayoutEffect } from 'react-use';
import { useIntl } from 'react-intl';
import { useForm, Field } from 'react-final-form';
import { useMemoOne, ReactSelectField } from '@openagenda/react-shared';

import getMultiLanguageLabel from '../../utils/getMultiLanguageLabel';
import stateMessages from '../../utils/stateMessages';
import messages from './messages';
import Radio from './Radio';

export default ({ id, name, aggregatorAgendaSchema }) => {
  const intl = useIntl();
  const form = useForm();
  const { values, initialValues: initials } = form.getState();

  const action = useMemo(() => values.actions.find(v => v.id === id), [
    id,
    values.actions
  ]);
  const fieldName = useMemoOne(() => action?.field, [action]);
  const prevFieldName = usePrevious(fieldName);
  const initialValues = useRef(initials).current;

  const automatic = useMemoOne(() => !!action?.automatic, [action]);
  const prevAutomatic = usePrevious(automatic);

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
    [aggregatorAgendaSchema.fields, intl, fieldName, values.actions]
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
    advancedMode
  ]);

  return (
    <>
      <ReactSelectField
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
            </>
          ) : null}
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
