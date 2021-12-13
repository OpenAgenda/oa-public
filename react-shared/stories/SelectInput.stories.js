import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import ReactSelectInput from '../src/components/ReactSelectInput';
import Modal from '../src/components/Modal';
import AdminCanvas from './decorators/AdminCanvas';

export default {
  title: 'SelectInput',
  component: ReactSelectInput,
};

export const SelectInput = () => {
  const onChange = value => console.log('onChange:', value);

  return (
    <div style={{ flex: '0 0 60%' }}>
      <p>Input permettant de rechercher et sélectionner une option.</p>
      <ReactSelectInput
        name="example"
        placeholder="example"
        options={[
          { label: 'first option', value: 'first option' },
          { label: 'second option', value: 'second option' },
          { label: 'third option', value: 'third option' }
        ]}
        onChange={onChange}
      />
    </div>
  );
};
SelectInput.decorators = [AdminCanvas];

export const InModal = () => {
  const onChange = value => console.log('onChange:', value);
  const [display, setDisplay] = useState(true);

  return (
    <div style={{ flex: '0 0 60%' }}>
      <p>Input permettant de rechercher et sélectionner une option.</p>

      <button className="js_export_button btn btn-default btn-primary" type="button" onClick={() => setDisplay(true)}>
        <i className="fa fa-external-link" />
        <span>&nbsp; Open</span>
      </button>

      {display ? (
        <Modal
          title="Modal"
          onClose={() => setDisplay(false)}
          classNames={{ overlay: 'popup-overlay' }}
        >
          <ReactSelectInput
            name="example"
            placeholder="example"
            options={[
              { label: 'first option', value: 'first option' },
              { label: 'second option', value: 'second option' },
              { label: 'third option', value: 'third option' },
            ]}
            onChange={onChange}
            menuPosition="fixed"
          />
        </Modal>
      ) : null}
    </div>
  );
};
