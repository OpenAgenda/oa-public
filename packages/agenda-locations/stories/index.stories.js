import ih from 'immutability-helper';
import React from 'react';
import { storiesOf } from '@storybook/react';
import createReactClass from 'create-react-class';
import agendaTestSettings from './agendaTestSettings.json';
import locationSet from './locationSet.json';

import adminStory from './admin.story';
import selectorStory from './selector.story';
import termStore from './term.story';

import '../components/src/verifiedLocationsCounter';

import '@openagenda/bs-templates/compiled/main.css';

import location from './location.json';

const getHostname = () => (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

const apiRoot = `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}`;
const res = {
  index: `${apiRoot}/`,
  geocode: `${apiRoot}/geocode`,
  reverseGeocode: `${apiRoot}/geocode/reverse`,
  insee: `${apiRoot}/insee`,
  get: `${apiRoot}/:locationUid`,
  update: `${apiRoot}/:locationUid`,
  create: `${apiRoot}/`,
  remove: `${apiRoot}/:locationUid`,
  merge: `${apiRoot}/merge`,
  csv: '#csv',
  xlsx: '#xlsx',
  seeEvents: `${apiRoot}/:agendaSlug/admin?locationUid=:locationUid`,
  suggestChange: `https://openagenda.com/mail-repair-cafe/locations/:locationUid/suggest-change/conversation/create`
};

storiesOf('Administration app', module)
  .add('Main', () => adminStory({
    res,
    settings: agendaTestSettings
  }))
  .add('with location set', () => adminStory({
    res,
    settings: agendaTestSettings,
    set: locationSet
  }));


storiesOf('Location form component', module)
  .add('Search mode', () => selectorStory({
    res,
    settings: agendaTestSettings,
    mode: 'search'
  }))
  .add('Search mode with confirm required', () => selectorStory({
    res,
    settings: agendaTestSettings,
    confirmRequired: true,
    mode: 'search'
  }))
  .add('Creation mode', () => selectorStory({
    res,
    settings: agendaTestSettings,
    initialLocation: undefined,
    enableGeocode: true,
    detailedInfo: true,
    mode: 'create'
  }))
  .add('Show mode', () => selectorStory({
    res,
    settings: agendaTestSettings,
    initialLocation: location,
    enableGeocode: true,
    mode: 'show'
  }))
  .add('Confirm mode', () => selectorStory({
    res,
    settings: agendaTestSettings,
    initialLocation: location,
    enableGeocode: true,
    mode: 'confirm'
  }))
  .add('Creation mode with geolocation disabled', () => selectorStory({
    res,
    settings: agendaTestSettings,
    initialLocation: undefined,
    enableGeocode: false
  }));

storiesOf('Term selector', module)
  .add('Main', () => termStore({
    apiRoot
  }));
