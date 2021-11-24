import React from 'react';
import { useFilterTitle } from '../hooks';
import ValueBadge from './ValueBadge';

export default function FilterPreviewer({
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
          <span key={option.value} className={className} title={title}>
            <ValueBadge
              label={option.label}
              onRemove={onRemove(option)}
              disabled={disabled}
            />
          </span>
        ))}
      </>
    );
  }

  // single
  if (label) {
    return (
      <span className={className} title={title}>
        <ValueBadge label={label} onRemove={onRemove} disabled={disabled} />
      </span>
    );
  }

  return null;
}
