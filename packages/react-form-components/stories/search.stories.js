import { useState } from 'react';
import update from 'immutability-helper';
import SearchField from '../components/SearchField';
import PageDecorator from './decorators/PageDecorator';
import defaultState from './state';

import '@openagenda/bs-templates/compiled/main.css';

function onChange(state, name, value) {
  const change = { values: {} };

  change.values[name] = { $set: value };

  return update(state, change);
}

export default {
  title: 'Search',
  decorators: [PageDecorator],
};

export function Loading() {
  const [state, setState] = useState(defaultState);

  return (
    <SearchField
      name="search"
      value={state.values.search}
      label="a hidden label"
      placeholder="do your search"
      threshold={2}
      onChange={(name, value) => setState(onChange(state, name, value))}
      loading
    />
  );
}

export function Threshold5() {
  const [state, setState] = useState(defaultState);

  return (
    <SearchField
      name="search"
      value={state.values.search}
      label="a hidden label"
      placeholder="do your search"
      threshold={5}
      onChange={(name, value) => setState(onChange(state, name, value))}
      loading={false}
    />
  );
}
