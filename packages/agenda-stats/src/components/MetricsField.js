import React from 'react';
import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';
import form from '../messages/form';

const initialMetricsValue = ['avg'];

export default function MetricsField({ name = 'metrics' }) {
  const intl = useIntl();

  return (
    <>
      <div className="checkbox">
        <label htmlFor="min">
          <Field
            id="min"
            name={name}
            component="input"
            type="checkbox"
            value="min"
          />
          {intl.formatMessage(form.min)}
        </label>
      </div>

      <div className="checkbox">
        <label htmlFor="avg">
          <Field
            id="avg"
            name={name}
            component="input"
            type="checkbox"
            value="avg"
            initialValue={initialMetricsValue}
          />
          {intl.formatMessage(form.avg)}
        </label>
      </div>

      <div className="checkbox">
        <label htmlFor="max">
          <Field
            id="max"
            name={name}
            component="input"
            type="checkbox"
            value="max"
          />
          {intl.formatMessage(form.max)}
        </label>
      </div>

      <div className="checkbox">
        <label htmlFor="sum">
          <Field
            id="sum"
            name={name}
            component="input"
            type="checkbox"
            value="sum"
          />
          {intl.formatMessage(form.sum)}
        </label>
      </div>
    </>
  );
}
