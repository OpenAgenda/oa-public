/* eslint-disable-next-line */
import React from 'react';
import { useIntl } from 'react-intl';
import { usePrevious, useIsomorphicLayoutEffect } from 'react-use';

import { useForm, Field } from 'react-final-form';

import { useMemoOne, ReactSelectField } from '@openagenda/react-shared';
import formLabels from '@openagenda/labels/event/form';
import { getLocaleValue } from '@openagenda/intl';
import isOptionedField from '../../utils/isOptionedField';
import messages from './messages';

const AttendanceOptions = [
  {
    id: 1,
    value: 'offlineAttendanceMode',
    label: formLabels.offlineAttendanceMode,
  },
  {
    id: 2,
    value: 'onlineAttendanceMode',
    label: formLabels.onlineAttendanceMode,
  },
  {
    id: 3,
    value: 'mixedAttendanceMode',
    label: formLabels.mixedAttendanceMode,
  },
];

export default ({ sourceSchema }) => {
  const intl = useIntl();
  const form = useForm();

  const { values /* , initialValues */ } = form.getState();

  const options = useMemoOne(
    () =>
      sourceSchema.fields
        .filter(isOptionedField)
        .concat([{ field: 'attendanceMode', label: formLabels.attendanceMode }])
        .map(({ field, label }) => ({
          value: field,
          label: getLocaleValue(label, intl.locale),
        })),
    [intl.locale, sourceSchema.fields],
  );

  const fieldName = useMemoOne(() => values.choiceField, [values]);
  const prevFieldName = usePrevious(fieldName);

  const fieldSchema = useMemoOne(() => {
    if (fieldName === 'attendanceMode') {
      return {
        options: AttendanceOptions,
      };
    }
    return sourceSchema.fields.find(v => v.field === fieldName);
  }, [sourceSchema, fieldName]);

  useIsomorphicLayoutEffect(() => {
    if (prevFieldName && fieldName && prevFieldName !== fieldName) {
      form.change('choiceValues', null);
    }
  }, [prevFieldName, fieldName, form]);

  const valuesOptions = useMemoOne(() => {
    if (fieldSchema?.options) {
      return fieldSchema.options.map(v => ({
        value: v.id,
        label: getLocaleValue(v.label, intl.locale),
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
            <ReactSelectField
              name="choiceField"
              Field={Field}
              placeholder={intl.formatMessage(messages.selectField)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              options={options}
              menuPosition="fixed"
              isSearchable
              // initialValue={initialValues?.choiceField}
            />
          </div>
        </div>
      </div>

      {values.choiceField ? (
        <div className="row">
          <div className="form-group form-group-v-aligned">
            <label className="control-label col-sm-2" htmlFor="choiceValues">
              {intl.formatMessage(messages.values)}
            </label>

            <div className="col-sm-10">
              <ReactSelectField
                name="choiceValues"
                Field={Field}
                /* initialValue={
                  values.choiceField !== undefined
                  && values.choiceField === initialValues?.choiceField
                    ? initialValues?.choiceValues
                    : undefined
                } */
                placeholder={intl.formatMessage(messages.selectValue)}
                noOptionsMessage={() => intl.formatMessage(messages.noOption)}
                options={valuesOptions}
                menuPosition="fixed"
                isMulti
                isSearchable
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
