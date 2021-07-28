import React from 'react';
import classNames from 'classnames';
import { defineMessages, useIntl } from 'react-intl';
import getLocaleValue from '@openagenda/react-shared/lib/utils/getLocaleValue';

const messages = defineMessages({
  removeFilter: {
    id: 'ReactFilters.ValueBadge.removeFilter',
    defaultMessage: 'Remove filter',
  },
});

export default function ValueBadge({ label, onRemove, disabled }) {
  const intl = useIntl();

  return (
    <div className="badge badge-info">
      {getLocaleValue(label)}
      <button
        type="button"
        title={intl.formatMessage(messages.removeFilter)}
        className={classNames('btn btn-link btn-link-inline margin-left-xs', {
          disabled,
        })}
        // disabled={disabled}
        onClick={onRemove}
      >
        <i className="fa fa-times" aria-hidden="true" />
      </button>
    </div>
  );
}
