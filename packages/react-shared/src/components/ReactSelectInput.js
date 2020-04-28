import React from 'react';
import CreatableSelect from 'react-select/creatable';
import ReactSelect from 'react-select';

export default ({
  innerRef, creatable, input, meta, ...rest
}) => {
  const SelectComponent = creatable ? CreatableSelect : ReactSelect;

  return (
    <>
      <SelectComponent
        ref={innerRef}
        {...input}
        creatable={creatable}
        {...rest}
      />

      {!meta.dirtySinceLastSubmit && meta.submitError ? (
        <div className="margin-top-xs margin-bottom-sm text-danger">
          {meta.submitError}
        </div>
      ) : null}
    </>
  );
};
