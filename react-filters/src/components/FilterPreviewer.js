import useFilterTitle from '../hooks/useFilterTitle.js';
import ValueBadge from './ValueBadge.js';

export default function FilterPreviewer({
  withTitle = true,
  name,
  filter,
  label,
  valueOptions,
  onRemove,
  disabled,
  className,
}) {
  const title = useFilterTitle(name, filter.fieldSchema);

  // multi
  if (valueOptions?.length) {
    return (
      <>
        {valueOptions.map((option) => (
          <span key={option.value} className={className}>
            <ValueBadge
              label={option.label}
              onRemove={onRemove(option)}
              disabled={disabled}
              title={withTitle ? title : null}
            />
          </span>
        ))}
      </>
    );
  }

  // single
  if (label) {
    return (
      <span className={className}>
        <ValueBadge
          label={label}
          onRemove={onRemove}
          disabled={disabled}
          title={withTitle ? title : null}
        />
      </span>
    );
  }

  return null;
}
