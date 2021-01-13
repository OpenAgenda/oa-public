import ih from 'immutability-helper';
import React from 'react';
import { storiesOf } from '@storybook/react';
import createReactClass from 'create-react-class';
import agendaTestSettings from './fixtures/agendaTestSettings.json';
import locationSet from './fixtures/locationSet.json';

import debug from 'debug';

import debug from 'debug';

import adminStory from './admin.story';
import selectorStory from './selector.story';
import termStore from './term.story';
import mergeStory from './merge.story';

import mergePropsFixtures from './fixtures/mergeProps.json';
import mergeFormStateFixtures from './fixtures/mergeFormState.json';

import '../components/src/verifiedLocationsCounter';

import '@openagenda/bs-templates/compiled/main.css';

import location from './fixtures/location.json';

debug.enable('*');

debug.enable('*');

const getHostname = () =>
  typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const apiRoot = `http://${getHostname()}:${process.env.STORYBOOK_API_PORT}`;

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null
};

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
  suggestChange: `https://openagenda.com/mail-repair-cafe/locations/:locationUid/suggest-change/conversation/create`,
};

storiesOf('Administration app', module)
  .add('Main', () =>
    adminStory({
      res,
      settings: {...agendaTestSettings, access: {
        create: defaultAccess,
        update: defaultAccess,
        merge: defaultAccess,
        delete: defaultAccess
      }},
    })
  )
  .add('with location set', () =>
    adminStory({
      res,
      settings: {...agendaTestSettings, access: {
        create: defaultAccess,
        update: defaultAccess,
        merge: defaultAccess,
        delete: defaultAccess
      }},
      set: locationSet,
    })
  );

storiesOf('Access', module)

  .add('All access', () =>
    adminStory({
      res,
      settings: {...agendaTestSettings, access: {
        create: defaultAccess,
        update: defaultAccess,
        merge: defaultAccess,
        delete: defaultAccess
      }},
      set: locationSet,
    })
  )
  .add('No Access', () =>
    adminStory({
      res,
      settings: {...agendaTestSettings, access: {
        create: {...defaultAccess, authorized: false},
        update: {...defaultAccess, authorized: false},
        merge: {...defaultAccess, authorized: false},
        delete: {...defaultAccess, authorized: false}
      }},
      set: locationSet,
    })
  )
  .add('Update Only', () =>
    adminStory({
      res,
      settings: {...agendaTestSettings, access: {
        create: {...defaultAccess, authorized: false},
        update: defaultAccess,
        merge: {...defaultAccess, authorized: false},
        delete: {...defaultAccess, authorized: false}
      }},
      set: locationSet,
    })
  )
  .add('Update Link, CCN', () =>
    adminStory({
      res,
      settings: {...agendaTestSettings, access: {
        create: defaultAccess,
        update : {authorized: true, external: true, link: 'https://cartes.culture.gouv.fr/lieux/{extId}?jwtToken=token', serviceLabel: 'CultureChezNous' },
        merge: {...defaultAccess, authorized: false},
        delete: {...defaultAccess, authorized: false}
      }},
      set: locationSet,
    })
  );

storiesOf('Merge form', module)
  .add('On distinguera plus tard', () => mergeStory({
    ...mergePropsFixtures,
    actions: {
      getState: () => ({
        form: mergeFormStateFixtures
      })
    }
  }));

storiesOf('Location form component', module)
  .add('Search mode', () =>
    selectorStory({
      res,
      settings: agendaTestSettings,
      mode: 'search',
    })
  )
  .add('Search mode with confirm required', () =>
    selectorStory({
      res,
      settings: agendaTestSettings,
      confirmRequired: true,
      mode: 'search',
    })
  )
  .add('Creation mode', () =>
    selectorStory({
      res,
      settings: agendaTestSettings,
      initialLocation: undefined,
      enableGeocode: true,
      detailedInfo: true,
      mode: 'create',
    })
  )
  .add('Show mode', () =>
    selectorStory({
      res,
      settings: agendaTestSettings,
      initialLocation: location,
      enableGeocode: true,
      mode: 'show',
    })
  )
  .add('Confirm mode', () =>
    selectorStory({
      res,
      settings: agendaTestSettings,
      initialLocation: location,
      enableGeocode: true,
      mode: 'confirm',
    })
  )
  .add('Creation mode with geolocation disabled', () =>
    selectorStory({
      res,
      settings: agendaTestSettings,
      initialLocation: undefined,
      enableGeocode: false,
    })
  );

storiesOf('Term selector', module).add('Main', () =>
  termStore({
    apiRoot,
  })
);
