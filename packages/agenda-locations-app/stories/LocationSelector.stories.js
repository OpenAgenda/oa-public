import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import LocationSelector from '../src/components/LocationSelector';

import agendaSettings from './fixtures/agendaTestSettings.json';
import propLocation from './fixtures/location.json';
import Providers from './decorators/Providers';
import ComponentCanvas from './decorators/ComponentCanvas';

const res = {
  index: '/api/agendas/:agendaUid/locations?detailed=1',
  getSettings: '/api/agendas/:agendaUid/locations/settings',
  get: '/api/agendas/:agendaUid/locations/:locationUid?detailed=1',
  create: '/api/agendas/:agendaUid/locations',
  update: '/api/agendas/:agendaUid/locations/:locationUid',
  merge: '/api/agendas/:agendaUid/locations/merge',
  remove: '/api/agendas/:agendaUid/locations/:locationUid',
  geocode: '/api/agendas/:agendaUid/locations/geocode',
  reverseGeocode: '/api/agendas/:agendaUid/locations/geocode/reverse',
  insee: '/api/agendas/:agendaUid/locations/insee',
  csv: '#csv',
  xlsx: '#xlsx',
  disqualifyDuplicates: '/api/agendas/:agendaUid/locations/disqualify',
  agendaSearch: '/api/agendas/:agendaUid/locations/agendas',
  seeEvents: '/api/agendas/:agendaUid/locations/:agendaSlug/admin?locationUid=:locationUid&q.locationUid=:locationUid',
  suggestChange: 'https://openagenda.com/mail-repair-cafe/locations/:locationUid/suggest-change/conversation/create'
};

export default {
  title: 'LocationSelector',
  decorators: [ComponentCanvas, Providers]
};

export const SelectMode = () => {
  const [mode, setMode] = useState('show');
  const [location, setLocation] = useState(propLocation);
  return (
    <LocationSelector
      agenda={{ uid: 1 }}
      mode={mode}
      lang="fr"
      settings={agendaSettings}
      res={res}
      location={location}
      onChange={(t, l) => { setMode(t); setLocation(l); }}
    />
  );
};

export const CreateMode = () => {
  const [mode, setMode] = useState('create');
  const [location, setLocation] = useState(null);
  return (
    <LocationSelector
      agenda={{ uid: 1 }}
      mode={mode}
      lang="fr"
      settings={agendaSettings}
      res={res}
      location={location}
      onChange={(t, l) => { setMode(t); setLocation(l); }}
    />
  );
};

export const SearchMode = () => {
  const [mode, setMode] = useState('search');
  const [location, setLocation] = useState(null);
  return (
    <LocationSelector
      agenda={{ uid: 1 }}
      mode={mode}
      lang="fr"
      settings={agendaSettings}
      res={res}
      location={location}
      onChange={(t, l) => { setMode(t); setLocation(l); }}
    />
  );
};

export const ConfirmMode = () => {
  const [mode, setMode] = useState('confirm');
  const [location, setLocation] = useState(null);
  return (
    <LocationSelector
      agenda={{ uid: 1 }}
      mode={mode}
      lang="fr"
      settings={agendaSettings}
      res={res}
      location={location}
      onChange={(t, l) => { setMode(t); setLocation(l); }}
    />
  );
};
