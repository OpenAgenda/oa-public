import React from 'react';
import { useIntl } from 'react-intl';
import { useFormState } from 'react-final-form';
import classNames from 'classnames';
import messages from './messages';

export default function AddRuleSubmitButton({ handleSubmit, onCancel }) {
  const intl = useIntl();
  const { values } = useFormState();

  const hasExtendedValues = Array.isArray(values.extendedValues)
    ? values.extendedValues.length
    : !['', null, undefined].includes(values.extendedValues);
  const hasFilter = values.tagValues?.length || values.locationValues || hasExtendedValues;
  const disabled = !hasFilter
    && !(
      values.withActions
      && (values.actions || []).some(v => !['', null, undefined].includes(v.field))
    );

  return (
    <div>
      <div className="pull-left">
        <button
          type="button"
          className="btn btn-link text-danger cancel-button-left"
          onClick={onCancel}
        >
          {intl.formatMessage(messages.cancel)}
        </button>
      </div>

      <div className="text-right">
        <button
          type="submit"
          disabled={disabled}
          className={classNames('btn btn-primary', { disabled })}
          onClick={handleSubmit}
        >
          {intl.formatMessage(messages.add)}
        </button>
      </div>
    </div>
  );
}
