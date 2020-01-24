import React from 'react';
import { storiesOf } from '@storybook/react';
import createReactClass from 'create-react-class';
import agendaTestSettings from './agendaTestSettings.json';

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
  set: `${apiRoot}/`,
  remove: `${apiRoot}/remove`,
  merge: `${apiRoot}/merge`,
  csv: '#csv',
  removeSuggestion: `${apiRoot}/:locationUid/suggestion/remove`,
  image: {
    upload: `${apiRoot}/:locationUid/image`,
    remove: `${apiRoot}/:locationUid/image/remove`,
    newUpload: `${apiRoot}/image`,
    newRemove: `${apiRoot}/image/remove`
  },
  seeEvents: `${apiRoot}/:agendaSlug/admin?locationUid=:locationUid`
};

storiesOf('Administration app')
  .add('Main', () => adminStory({
    res,
    settings: agendaTestSettings
  }))

storiesOf('Location form component')
  .add('Search mode', () => selectorStory({
    res,
    settings: agendaTestSettings,
    mode: 'search'
  }))
  .add('Creation mode', () => selectorStory({
    res,
    settings: agendaTestSettings,
    initialLocation: undefined,
    enableGeocode: true,
    mode: 'create'
  }))
  .add('Show mode', () => selectorStory({
    res,
    settings: agendaTestSettings,
    initialLocation: location,
    enableGeocode: true,
    mode: 'show'
  }))
  .add('Creation mode with gelocation disabled', () => selectorStory({
    res,
    settings: agendaTestSettings,
    initialLocation: undefined,
    enableGeocode: false
  }));

storiesOf('Term selector')
  .add('Main', () => termStore({
    apiRoot
  }));
