import React from 'react';
import { Field } from 'react-final-form';
import Select from 'react-select';

export default function SelectField({
  visible = true,
  name,
  options,
  className,
  classNameSelect,
  ...selectProps
}) {
  if (!visible) {
    return null;
  }

  return (
    <Field
      name={name}
      parse={val => val && val.value}
      format={val => options.find(o => o.value === val)}
      render={({ input, meta, ...rest }) => (
        <Select
          {...input}
          {...rest}
          options={options}
          className={className}
          classNamePrefix={classNameSelect}
        />
      )}
      {...selectProps}
    />
  );
}
