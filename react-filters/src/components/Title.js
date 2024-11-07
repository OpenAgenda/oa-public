import React from 'react';
import { useField } from 'react-final-form';
import useFilterTitle from '../hooks/useFilterTitle.js';

const subscription = { value: true };

export default function Title({ name, filter, component, ...rest }) {
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = useField(name, { subscription });

  const { input } = field;

  if (
    !input.value?.length
    && !(typeof input.value === 'object' && input.value !== null)
  ) {
    return <div>{title}</div>;
  }

  if (!component) {
    return null;
  }

  return (
    <div className="flex-auto">
      <span className="padding-right-xs">{title}</span>
      {React.createElement(component, {
        name,
        filter,
        className: 'oa-filter-value-preview',
        withTitle: false,
        ...rest,
      })}
    </div>
  );
}
