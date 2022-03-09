import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import LocationSelector from '../src/components/LocationSelector';

import agendaSettings from './fixtures/slslf-2022.json';
import propLocation from './fixtures/location.json';
import Providers from './decorators/Providers';
import ComponentCanvas from './decorators/ComponentCanvas';

const res = {
  index: '/api/agendas/1/locations?detailed=1',
  getSettings: '/api/agendas/1/locations/settings',
  get: '/api/agendas/1/locations/:locationUid?detailed=1',
  create: '/api/agendas/1/locations',
  update: '/api/agendas/1/locations/:locationUid',
  merge: '/api/agendas/1/locations/merge',
  remove: '/api/agendas/1/locations/:locationUid',
  geocode: '/api/agendas/1/locations/geocode',
  reverseGeocode: '/api/agendas/1/locations/geocode/reverse',
  insee: '/api/agendas/1/locations/insee',
  csv: '#csv',
  xlsx: '#xlsx',
  disqualifyDuplicates: '/api/agendas/1/locations/disqualify',
  agendaSearch: '/api/agendas/1/locations/agendas',
  seeEvents: '/api/agendas/1/locations/:agendaSlug/admin?locationUid=:locationUid&q.locationUid=:locationUid',
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
      disableChange={false}
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
      detailedInfo
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
