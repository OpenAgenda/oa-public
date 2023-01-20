import { useFilterTitle } from '@openagenda/react-filters';
import ValueTag from './ValueTag';

export default function FilterPreviewer({
  withTitle = true,
  name,
  filter,
  label,
  valueOptions,
  onRemove,
  disabled,
}) {
  const title = useFilterTitle(name, filter.fieldSchema);

  // multi
  if (valueOptions?.length) {
    return (
      <>
        {valueOptions.map(option => (
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
