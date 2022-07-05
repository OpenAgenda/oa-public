import React from 'react';

import TextField from '@openagenda/form-schemas/client/build/Components/TextField';
import MarkdownField from '@openagenda/form-schemas/client/build/Components/MarkdownField';

const ConfigurableTextarea = props => {
  const { field } = props;
  if (field.mode === 'textarea') {
    return (
      <TextField
        {...props}
        field={{ ...field, fieldType: 'textarea' }}
      />
    );
  }
  return (
    <MarkdownField
      {...props}
      field={{ ...field, fieldType: 'textarea' }}
    />
  );
};
export default ConfigurableTextarea;
