import React from 'react';
import { useFilterTitle } from '../hooks';
import ValueBadge from './ValueBadge';

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
        {valueOptions.map(option => (
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
