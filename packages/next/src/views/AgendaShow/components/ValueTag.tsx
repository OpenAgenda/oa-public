import { useIntl } from 'react-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-regular-svg-icons';
import { Button } from '@openagenda/uikit';
import { getLocaleValue } from '@openagenda/intl';

// Messages from react-filters
const messages = {
  removeFilter: {
    id: 'ReactFilters.ValueBadge.removeFilter',
    defaultMessage: 'Remove filter',
  },
  removeFilterWithTitle: {
    id: 'ReactFilters.ValueBadge.removeFilterWithTitle',
    defaultMessage: 'Remove filter ({title})',
  },
};

export default function ValueTag({
  label,
  title = null,
  onRemove,
  disabled,
}) {
  const intl = useIntl();

  const titleLabel = title?.length
    ? intl.formatMessage(messages.removeFilterWithTitle, { title })
    : intl.formatMessage(messages.removeFilter);

  return (
    <Button
      rightIcon={<FontAwesomeIcon icon={faXmark} />}
      size="sm"
      borderRadius="full"
      variant="solid"
      colorScheme="primary"
      title={titleLabel}
      onClick={onRemove}
      isDisabled={disabled}
      lineHeight="none"
      h="6"
      px="2"
      iconSpacing="2"
    >
      {getLocaleValue(label, intl.locale)}

    </Button>
  );
}
