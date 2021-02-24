import React from 'react';
import { useIntl } from 'react-intl';
import { Field, useForm } from 'react-final-form';

import { useMemoOne, ReactSelectField } from '@openagenda/react-shared';
import formLabels from '@openagenda/labels/event/form';
import getLocalValue from '../../utils/getLocalValue';
import messages from './messages';

const eventFields = ['title', 'description', 'keywords', 'conditions'].map(
  field => ({
    field,
    label: formLabels[field],
  })
);

export default ({ sourceSchema }) => {
  const intl = useIntl();
  const form = useForm();

  const { values, initialValues } = form.getState();

  const options = useMemoOne(
    () => sourceSchema.fields
      .filter(v => ['text', 'textarea', 'markdown'].includes(v.fieldType))
      .concat(eventFields)
      .map(({ field, label }) => ({
        value: field,
        label: getLocalValue(label, intl.locale)
          ? getLocalValue(label, intl.locale)
          : field,
      })),
    [intl.locale, sourceSchema.fields]
  );

  return (
    <>
      <div className="row">
        <div className="form-group form-group-v-aligned">
          <label className="control-label col-sm-2" htmlFor="textField">
            {intl.formatMessage(messages.field)}
          </label>

          <div className="col-sm-10">
            <ReactSelectField
              name="textField"
              placeholder={intl.formatMessage(messages.selectField)}
              noOptionsMessage={() => intl.formatMessage(messages.noOption)}
              options={options}
              menuPosition="fixed"
              isSearchable
              initialValue={initialValues?.textField}
            />
          </div>
        </div>
      </div>

      {values.textField ? (
        <Field
          name="textValue"
          render={({ input }) => (
            <div className="row">
              <div className="form-group form-group-v-aligned">
                <label className="control-label col-sm-2" htmlFor="textValue">
                  {intl.formatMessage(messages.value)}
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    className="form-control"
                    {...input}
                    placeholder="substring"
                  />
                </div>
              </div>
            </div>
          )}
        />
      ) : null}
    </>
  );
};
