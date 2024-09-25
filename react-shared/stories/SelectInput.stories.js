import { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import { Form, Field } from 'react-final-form';

import ReactSelectInput from '../src/components/ReactSelectInput';
import ReactSelectField from '../src/components/ReactSelectField';
import Modal from '../src/components/Modal';
import AdminCanvas from './decorators/AdminCanvas';

export default {
  title: 'SelectInput',
  component: ReactSelectInput,
};

export const SelectInput = () => {
  const onChange = (value) => console.log('onChange:', value);

  return (
    <div style={{ flex: '0 0 60%' }}>
      <p>Input permettant de rechercher et sélectionner une option.</p>
      <ReactSelectInput
        name="example"
        placeholder="example"
        options={[
          { label: 'first option', value: 'first option' },
          { label: 'second option', value: 'second option' },
          { label: 'third option', value: 'third option' },
        ]}
        onChange={onChange}
      />
    </div>
  );
};
SelectInput.decorators = [AdminCanvas];

export const CreatableMultiSelectInput = () => {
  const [value, setValue] = useState([]);

  return (
    <div style={{ flex: '0 0 60%' }}>
      <p>
        Input d&apos;ajouter des options et d&apos;en placer plusieurs en les
        séparant avec des virgules.
      </p>
      <p>onChange</p>
      <ReactSelectInput
        value={value}
        name="example"
        placeholder="example"
        isCreatable
        isMulti
        separator=","
        options={[{ label: 'first option', value: 'first option' }]}
        onChange={(v) => {
          setValue(v);
        }}
      />
    </div>
  );
};
CreatableMultiSelectInput.decorators = [AdminCanvas];

const Component = ({ handleSubmit }) => (
  <form onSubmit={handleSubmit} className="col-sm-12">
    <ReactSelectField
      isCreatable
      isMulti
      separator=","
      name="achoice"
      Field={Field}
      placeholder="Choose"
      noOptionsMessage={() => 'Choose something choosable'}
      options={[
        { label: 'First option', value: 'firstoption' },
        { label: 'Second option', value: 'secondoption' },
      ]}
    />
    <Field
      name="name"
      render={({ input }) => (
        <div className="form-group margin-top-sm">
          <label htmlFor="name">Name</label>
          <input className="form-control" type="text" id="name" {...input} />
        </div>
      )}
    />
    <button className="form-control" type="submit">
      Submit
    </button>
  </form>
);

export const InReactFinalForm = () => {
  const onSubmit = (v) => {
    console.log('onSubmit', v);
  };

  return <Form className="row" onSubmit={onSubmit} component={Component} />;
};
InReactFinalForm.decorators = [AdminCanvas];

export const InModal = () => {
  const onChange = (value, ...rest) => console.log('onChange:', value, rest);
  const onClick = (value, ...rest) => console.log('onClick:', value, rest);
  const [display, setDisplay] = useState(true);

  return (
    <div style={{ flex: '0 0 60%' }}>
      <p>Input permettant de rechercher et sélectionner une option.</p>

      <button
        className="js_export_button btn btn-default btn-primary"
        type="button"
        onClick={() => setDisplay(true)}
      >
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
            onClick={onClick}
            menuPosition="fixed"
          />
        </Modal>
      ) : null}
    </div>
  );
};
