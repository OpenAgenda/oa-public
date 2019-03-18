"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );

process.env.DEBUG = 'test, middleware/*';

const log = require( '../lib/Log' )( 'test' );

const Portal = require( '../' );

Portal( {
  // used in a non development environment
  root: process.env.PORTAL_ROOT || 'https://somewhere.com',
  // agenda uid
  uid: 48353388,
  // site language
  lang: 'fr',
  // associated OA account key
  key: process.env.PORTAL_KEY || fs.readFileSync( __dirname + '/oa.key', 'utf-8' ),
  // views folder
  views: __dirname + '/views',
  sass: __dirname + '/sass/main.scss',
  assets: __dirname + '/assets',
  // number of events to be loaded in an event index page
  eventsPerPage: 20,
  // filter that applies when no other filter is specified
  defaultFilter: {
    featured: 0
  },

  cache: {
    // interval at which cache is refreshed ( in milliseconds )
    refreshInterval: 60*60*1000
  },
  // map tiles
  map: {
    tiles: {
      link: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    /*center: {
      latitude: 43.597198,
      longitude: 1.441136
    },*/
    zoom: 12
  },
  eventParser
} ).then( app => app.launch( 3000 ) );


function eventParser( event, { lang, moment } ) {

  //log( JSON.stringify( event, null, 2 ) );

  return event;

}
