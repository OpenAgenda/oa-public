import React from 'react';
import classNames from 'classnames';
import { defineMessages, useIntl } from 'react-intl';
import { css } from '@emotion/react';
import { getLocaleValue } from '@openagenda/intl';

const messages = defineMessages({
  removeFilter: {
    id: 'ReactFilters.ValueBadge.removeFilter',
    defaultMessage: 'Remove filter',
  },
  removeFilterWithTitle: {
    id: 'ReactFilters.ValueBadge.removeFilterWithTitle',
    defaultMessage: 'Remove filter ({title})',
  },
});

export default function ValueBadge({
  label,
  title,
  onRemove,
  disabled
}) {
  const intl = useIntl();

  const titleLabel = title?.length
    ? intl.formatMessage(messages.removeFilterWithTitle, { title })
    : intl.formatMessage(messages.removeFilter);

  return (
    <button
      type="button"
      title={titleLabel}
      className={classNames('btn badge badge-pill badge-info margin-right-xs', {
        disabled,
      })}
      css={css`
        line-height: 18px;
        padding-top: 0;
        padding-bottom: 0;

        :hover {
          color: #da4453;
          border-color: #d43f3a;
        }
      `}
      // disabled={disabled}
      onClick={onRemove}
    >
      {getLocaleValue(label, intl.locale)}
      &nbsp;
      <i className="fa fa-times" aria-hidden="true" />
    </button>
  );
}
