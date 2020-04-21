import React from 'react';

import { useIntl } from 'react-intl';
import { usePrevious, useIsomorphicLayoutEffect } from 'react-use';

import { useForm } from 'react-final-form';

import { useMemoOne } from '@openagenda/react-shared';
import getMultiLanguageLabel from '../../utils/getMultiLanguageLabel';
import SelectField from './SelectField';
import messages from './messages';

export default ({ sourceSchema }) => {
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
    [intl.locale, sourceSchema.fields]
  );

  const fieldName = useMemoOne(() => values.field, [values]);
  const prevFieldName = usePrevious(fieldName);

  const fieldSchema = useMemoOne(
    () => sourceSchema.fields.find(v => v.field === fieldName),
    [sourceSchema, fieldName]
  );

  useIsomorphicLayoutEffect(() => {
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
  }, [fieldSchema, intl.locale]);

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
                isMulti={fieldSchema?.fieldType === 'checkbox'}
                isSearchable
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
