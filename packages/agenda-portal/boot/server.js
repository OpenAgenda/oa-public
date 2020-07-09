'use strict';

// const log = require('../lib/Log')('server');
const Portal = require('..');

Portal.utils.loadEnvironment(__dirname);

function eventHook(event /* { lang, moment } */) {
  // log( JSON.stringify( event, null, 2 ) );

  return event;
}

Portal({
  root:
    process.env.PORTAL_ROOT || `http://localhost:${process.env.PORTAL_PORT}`,
  // agenda uid
  uid: process.env.PORTAL_AGENDA_UID,
  // site language
  lang: process.env.PORTAL_LANG || 'fr',
  // associated OA account key
  key: process.env.PORTAL_KEY,
  // views folder
  views: `${__dirname}/views`,
  sass: `${__dirname}/sass/main.scss`,
  assets: `${__dirname}/assets`,
  // number of events to be loaded in an event index page
  eventsPerPage: 20,
  // filter that applies when no other filter is specified
  defaultFilter: {
    featured: 0
  },
  // true if portal is to be displayed within iframe
  iframable: process.env.PORTAL_IFRAMABLE,
  iframeParent: process.env.PORTAL_IFRAME_PARENT,
  cache: {
    // interval at which cache is refreshed ( in milliseconds )
    refreshInterval: 60 * 60 * 1000
  },
  // map tiles
  map: {
    tiles: {
      link: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    auto: true,
    /* center: {
      latitude: 43.597198,
      longitude: 1.441136,
      zoom: 20
    }, */
    zoom: 12
  },
  eventHook
}).then(({ app }) => app.launch(process.env.PORTAL_PORT));
