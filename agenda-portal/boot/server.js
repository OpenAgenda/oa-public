'use strict';

// const log = require('../lib/Log')('server');

// Set options as a parameter, environment variable, or rc file.

const Portal = require('..');

Portal.utils.loadEnvironment(__dirname);

function eventHook(event /* { lang, agenda, root } */) {
  return event;
}

Portal({
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
  views: `${__dirname}/views`,
  // main sass file
  sass: `${__dirname}/sass/main.scss`,
  // assets folder
  assets: `${__dirname}/assets`,
  // multilingual labels folder
  i18n: `${__dirname}/i18n`,
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
  tracking: {
    useAgendaGoogleAnalytics: process.env.PORTAL_USE_AGENDA_GA_ID ?? false,
    // url of the link displayed in the cookie consent banner
    cookieBannerLink: 'https://support.google.com/analytics/answer/6004245?hl=fr'
  },
  eventHook,
  // proxyHookBeforeGet
}).then(({ app }) => app.launch(process.env.PORTAL_PORT));
