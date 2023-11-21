import React, { useState } from 'react';
import update from 'immutability-helper';
import GroupTagSelector from '../components/GroupTagSelector';
import PageDecorator from './decorators/PageDecorator';
import defaultState from './state';

import '@openagenda/bs-templates/compiled/main.css';

function onChange(state, name, value) {
  const change = { values: {} };

  change.values[name] = { $set: value };

  return update(state, change);
}

export default {
  title: 'GroupTagSelector',
  decorators: [
    PageDecorator,
  ],
};

export function Simple() {
  const [state, setState] = useState(defaultState);

  return (
    <GroupTagSelector
      name='tags'
      lang='fr'
      value={state.values.tags}
      onChange={(name, value) => setState(onChange(state, name, value))}
      set={state.groupSet}
    />
  );
}

export function Disabled() {
  const [state, setState] = useState(defaultState);

  return (
    <GroupTagSelector
      name='tags'
      lang='fr'
      value={state.values.tags}
      onChange={(name, value) => setState(onChange(state, name, value))}
      set={state.groupSet}
      disabledTagIds={[ 1, 3, 4, 5, 6 ]}
    />
  );
}
