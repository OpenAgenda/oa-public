import { useState } from 'react';
import update from 'immutability-helper';
import MultiInputField from '../components/MultiInputField';
import validators from '../validators';
import PageDecorator from './decorators/PageDecorator';
import defaultState from './state';

import '@openagenda/bs-templates/compiled/main.css';

function onChange(state, name, value) {
  const change = { values: {} };

  change.values[name] = { $set: value };

  return update(state, change);
}

export default {
  title: 'MultiInputField',
  decorators: [PageDecorator],
};

export function Simple() {
  const [state, setState] = useState(defaultState);

  return (
    <MultiInputField
      name="contacts"
      lang="fr"
      info="Faut taper des truc"
      value={state.values.contacts}
      validator={validators.list([
        validators.email(),
        validators.phone(),
        validators.link(),
      ])}
      onChange={(name, value) => setState(onChange(state, name, value))}
    />
  );
}

export function Disabled() {
  const [state, setState] = useState(defaultState);

  return (
    <MultiInputField
      enabled={false}
      name="contacts"
      lang="fr"
      info="Faut taper des truc"
      value={state.values.contacts}
      validator={validators.list([
        validators.email(),
        validators.phone(),
        validators.link(),
      ])}
      onChange={(name, value) => setState(onChange(state, name, value))}
    />
  );
}
