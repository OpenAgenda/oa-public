import React, { useState } from 'react';
import update from 'immutability-helper';
import InputField from '../components/InputField';
import makeLabelGetter from '../lib/makeLabelGetter';
import labels from '../labels';
import validators from '../validators';
import PageDecorator from './decorators/PageDecorator';
import defaultState from './state';

import '@openagenda/bs-templates/compiled/main.css';

const getLabel = makeLabelGetter( labels );

function onChange(state, name, value) {
  const change = { values: {} };

  change.values[name] = { $set: value };

  return update(state, change);
}

export default {
  title: 'Input',
  decorators: [
    PageDecorator,
  ],
};

export function Simple() {
  const [state, setState] = useState(defaultState);

  return (
    <>
      <InputField
        name="name"
        lang="fr"
        value={state.values.name}
        onChange={(name, value) => setState(onChange(state, name, value))}
        validator={validators.text({ min: 3, max: 20 })}
        getLabel={getLabel}
        autoFocus={true}
      />

      <InputField
        name="email"
        value={state.values.email}
        onChange={(name, value) => setState(onChange(state, name, value))}
        validator={validators.email({ field: 'email' })}
        getLabel={getLabel}
      />
    </>
  );
}

export function WithPlaceholderAndInfo() {
  const [state, setState] = useState(defaultState);

  return (
    <InputField
      name="phone"
      value={state.values.phone}
      onChange={(name, value) => setState(onChange(state, name, value))}
      getLabel={getLabel}
      placeholder="phonePlaceholder"
      info="phoneInfo"
      validator={validators.phone( { field: 'phone' } )}
    />
  );
}

export function Disabled() {
  const [state, setState] = useState(defaultState);
  return (
    <InputField
      name="email"
      value={state.values.email}
      onChange={(name, value) => setState(onChange(state, name, value))}
      validator={validators.email( { field: 'email' } )}
      getLabel={getLabel}
      enabled={false}
    />
  );
}
