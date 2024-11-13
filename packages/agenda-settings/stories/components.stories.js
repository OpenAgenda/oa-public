import '@openagenda/bs-templates/compiled/main.css';
import { useState } from 'react';
import FilterSelectComponent from '../src/client/components/FilterSelect.js';
import FiltersSettingsComponent from '../src/client/components/FiltersSettings.js';
import DeleteAgendaComponent from '../src/client/components/DeleteAgenda.js';
import Decorator from './decorators/Simple.js';
import IntlProviderDecorator from './decorators/IntlProvider.js';

import agenda from './fixtures/bdm.agenda.json';
import agendaWithModifiedFilters from './fixtures/jep.agenda.json';

export default {
  title: 'Components',
  decorators: [IntlProviderDecorator, Decorator],
};

export const FilterSelect = () => {
  const [selected, setSelected] = useState(['search', 'geo', 'timings']);
  return (
    <FilterSelectComponent
      value={selected}
      onChange={(update) => {
        setSelected(update);
      }}
      schema={agenda.schema}
    />
  );
};

export const EmptyFilterSelect = () => {
  const [selected, setSelected] = useState([]);
  return (
    <FilterSelectComponent
      value={selected}
      onChange={(update) => setSelected(update)}
      schema={agenda.schema}
    />
  );
};

export const FiltersSettings = () => {
  const [settings, setSettings] = useState(agenda.settings);

  return (
    <FiltersSettingsComponent
      schema={agenda.schema}
      settings={settings}
      onSubmit={(update) => setSettings(update)}
    />
  );
};

export const FiltersSettingsAsSaved = () => {
  const [settings, setSettings] = useState(agendaWithModifiedFilters.settings);

  return (
    <>
      <p>Save button is disabled if values match stored settings</p>
      <FiltersSettingsComponent
        schema={agenda.schema}
        settings={settings}
        onSubmit={(update) => setSettings(update)}
      />
    </>
  );
};

export const LoadingFiltersSettings = () => {
  const [settings, setSettings] = useState(agenda.settings);

  return (
    <FiltersSettingsComponent
      schema={agenda.schema}
      settings={settings}
      onSubmit={(update) => setSettings(update)}
      loading
    />
  );
};

export const ResettableFiltersSettings = () => {
  const [settings, setSettings] = useState(agendaWithModifiedFilters.settings);

  return (
    <FiltersSettingsComponent
      schema={agendaWithModifiedFilters.schema}
      settings={settings}
      onSubmit={(update) => setSettings(update)}
    />
  );
};

export const DeleteAgenda = () => <DeleteAgendaComponent />;

export const DeleteAgendaOnAuthenticateModal = () => (
  <DeleteAgendaComponent step="authenticate" />
);

export const DeleteAgendaConfirm = () => (
  <DeleteAgendaComponent step="confirm" />
);
