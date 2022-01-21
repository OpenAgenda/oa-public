'use strict';

// const log = require('../lib/Log')('server');

// Set options as a parameter, environment variable, or rc file.

const Portal = require('..');

Portal.utils.loadEnvironment(__dirname);

function eventHook(event /* { lang, agenda, root } */) {
  return event;
}

Portal({
  dir: __dirname,
  root: process.env.PORTAL_ROOT || `http://localhost:${process.env.PORTAL_PORT}`,
  devServerPort: process.env.PORTAL_DEV_SERVER_PORT || 3001,
  // agenda uid
  uid: process.env.PORTAL_AGENDA_UID,
  // site language
  lang: process.env.PORTAL_LANG || 'fr',
  // default timezone
  defaultTimezone: process.env.PORTAL_DEFAULT_TIMEZONE || 'Europe/Paris',
  // associated OA account key
  key: process.env.PORTAL_KEY,
  // views folder
  views: process.env.PORTAL_VIEWS_FOLDER,
  // main sass file
  sass: process.env.PORTAL_SASS_PATH,
  // main js file
  js: process.env.PORTAL_JS_PATH,
  // assets folder
  assets: process.env.PORTAL_ASSETS_FOLDER,
  // multilingual labels folder
  i18n: process.env.PORTAL_I18N_FOLDER,
  // number of events to be loaded in an event index page
  eventsPerPage: 20,
  // filters that applies even if other filter is specified, can be overloaded
  preFilter: {
    relative: ['current', 'upcoming']
  },
  // filter that applies when no other filter is specified
  defaultFilter: {
    // featured: 1,
  },
  // true if portal is to be displayed within iframe
  iframable: process.env.PORTAL_IFRAMABLE,
  iframeParent: process.env.PORTAL_IFRAME_PARENT_URL,
  cache: {
    // interval at which cache is refreshed ( in milliseconds )
    refreshInterval: 60 * 60 * 1000,
  },
  // map tiles
  map: {
    tiles: {
      link: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    auto: true,
    /* center: {
      latitude: 43.597198,
      longitude: 1.441136
    }, */
    zoom: 20,
  },
  eventHook,
  // proxyHookBeforeGet
}).then(({ app }) => app.launch(process.env.PORTAL_PORT));
