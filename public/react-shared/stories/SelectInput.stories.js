import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import { Form } from 'react-final-form';
import ReactSelectInput from '../src/components/ReactSelectInput';
import AdminCanvas from './decorators/AdminCanvas';

export default {
  title: 'SelectInput',
  component: ReactSelectInput,
  decorators: [AdminCanvas],
};

export const SelectInput = () => {
  const onSubmit = () => console.log('yes');

  return (
    <div style={{ flex: '0 0 60%' }}>
      <p>Input permettant de rechercher et sélectionner une option.</p>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <ReactSelectInput
              name="example"
              placeholder="example"
              options={[
                { label: 'first option', value: 'first option' },
                { label: 'second option', value: 'second option' },
                { label: 'third option', value: 'third option' },
              ]}
            />
          </form>
        )}
      />
    </div>
  );
};
