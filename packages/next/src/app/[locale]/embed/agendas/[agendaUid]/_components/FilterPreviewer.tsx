import { useFilterTitle } from '@openagenda/react-filters';
import { useIntl } from 'react-intl';
import { Button } from '@openagenda/uikit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-regular-svg-icons';
import { getLocaleValue } from '@openagenda/intl';
import messages from '../messages';

function ValueTag({ label, title = null, onRemove, disabled }) {
  const intl = useIntl();

  const titleLabel = title?.length
    ? intl.formatMessage(messages.removeFilterWithTitle, { title })
    : intl.formatMessage(messages.removeFilter);

  return (
    <Button
      size="sm"
      borderRadius="none"
      title={titleLabel}
      onClick={onRemove}
      disabled={disabled}
      lineHeight="none"
      h="8"
      px="2"
    >
      {getLocaleValue(label, intl.locale)}
      <FontAwesomeIcon icon={faXmark} />
    </Button>
  );
}

export default function FilterPreviewer({
  withTitle = true,
  name,
  filter,
  label,
  valueOptions = null,
  onRemove,
  disabled,
}) {
  const title = useFilterTitle(name, filter.fieldSchema);

  // multi
  if (valueOptions?.length) {
    return (
      <>
        {valueOptions.map((option) => (
          <ValueTag
            key={option.value}
            label={option.label}
            onRemove={onRemove(option)}
            disabled={disabled}
            title={withTitle ? title : null}
          />
        ))}
      </>
    );
  }

  // single
  if (label) {
    return (
      <ValueTag
        label={label}
        onRemove={onRemove}
        disabled={disabled}
        title={withTitle ? title : null}
      />
    );
  }

  return null;
}
