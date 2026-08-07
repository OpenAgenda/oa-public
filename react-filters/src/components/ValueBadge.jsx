import classNames from 'classnames';
import { defineMessages, useIntl } from 'react-intl';
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

export default function ValueBadge({ label, title, onRemove, disabled }) {
  const intl = useIntl();

  const titleLabel = title?.length
    ? intl.formatMessage(messages.removeFilterWithTitle, { title })
    : intl.formatMessage(messages.removeFilter);

  return (
    <button
      type="button"
      title={titleLabel}
      className={classNames(
        'btn badge badge-pill badge-info margin-right-xs oa-filters-value-badge',
        { disabled },
      )}
      // disabled={disabled}
      onClick={onRemove}
    >
      {getLocaleValue(label, intl.locale)}
      &nbsp;
      <i className="fa fa-times" aria-hidden="true" />
    </button>
  );
}
