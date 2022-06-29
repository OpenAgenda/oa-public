import React from 'react';

import TextField from '@openagenda/form-schemas/client/build/Components/TextField';
import MarkdownField from '@openagenda/form-schemas/client/build/Components/MarkdownField';

const CustomDesc = props => {
  const { field } = props;
  if (field.mode === 'textarea') {
    return (
      <TextField
        {...props}
      />
    );
  }
  return (
    <MarkdownField
      {...props}
    />
  );
};
export default CustomDesc;
