// Set options as a parameter, environment variable, or rc file.

import '@openagenda/agenda-portal/utils/loadEnvironment.js';

import Portal from '@openagenda/agenda-portal';
// import logs from '@openagenda/agenda-portal/lib/Log';
//
// const log = logs('server');

function eventHook(event /* , { lang, agenda, root } */) {
  return event;
}

Portal({
  dir: import.meta.dirname,
  root:
    process.env.PORTAL_ROOT || `http://localhost:${process.env.PORTAL_PORT}`,
  devServerPort: process.env.PORTAL_DEV_SERVER_PORT || 3001,
  // agenda uid
  uid: process.env.PORTAL_AGENDA_UID,
  // site language
  lang: process.env.PORTAL_LANG || 'fr',
  fallbackLang: process.env.PORTAL_FALLBACK_LANG ?? 'en',
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
  i18n: process.env.PORTAL_I18N_PATH,
  // number of events to be loaded in an event index page
  eventsPerPage: 20,
  // filters that applies even if other filter is specified, can be overloaded
  preFilter: {
    // relative: ['current', 'upcoming'],
  },
  // filter that applies when no other filter is specified
  defaultFilter: {
    // featured: 1,
  },
  manualSubmit: process.env.PORTAL_MANUAL_SUBMIT,
  filtersFormSelector: process.env.PORTAL_FILTERS_FORM_SELECTOR,
  // visibility of past events when relative or timings filter is specified
  visibilityPastEvents: process.env.PORTAL_VISIBILITY_PAST_EVENTS,
  // true if portal is to be displayed within iframe
  iframable: process.env.PORTAL_IFRAMABLE,
  iframeParent: process.env.PORTAL_IFRAME_PARENT_URL,
  cache: {
    maxEntries: 1000,
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
    cookieBannerLink:
      'https://support.google.com/analytics/answer/6004245?hl=fr',
    requireConsent: (process.env.PORTAL_REQUIRE_CONSENT ?? '1') === '1',
    gaIdOverride: process.env.PORTAL_GA_ID_OVERRIDE,
  },
  eventHook,
  // proxyHookBeforeGet
}).then(({ app }) => app.launch(process.env.PORTAL_PORT));
