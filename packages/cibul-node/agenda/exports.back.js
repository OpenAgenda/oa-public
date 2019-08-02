"use strict";

const locationMw = require( '@openagenda/agenda-locations' ).mw();
const gaTrack = require( '../lib/gaTrack.mw' );
const agendaSvc = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const eventSvc = require( '../services/event' );


const perPage = 20;

const preMw = [
  cmn.redirectLegacySearch,
  agendaSvc.mw.load( 'uid' )
];


module.exports = app => {

  app.get(
    '/agendas/:uid/admin/events.csv',
    preMw,
    cmn.checkAdminOrModeratorOrKey,
    locationMw.loadSettings( 'locationSettings' ),
    gaTrack( 'events', 'admin/export', 'csv' ),
    agendaSvc.mw.buildCsv( true )
  );

  app.get(
    '/agendas/:uid/admin/events.xlsx',
    preMw,
    cmn.checkAdminOrModeratorOrKey,
    locationMw.loadSettings( 'locationSettings' ),
    gaTrack( 'events', 'admin/export', 'xlsx' ),
    agendaSvc.mw.buildXlsx( true )
  );

  app.get(
    '/agendas/:uid/admin/events.rss',
    preMw,
    cmn.checkAdminOrModeratorOrKey,
    agendaSvc.mw.search( perPage, true ),
    gaTrack( 'events', 'admin/export', 'rss' ),
    agendaSvc.mw.rss
  );

  app.get(
    '/agendas/:uid/admin/events.json',
    preMw,
    cmn.checkAdminOrModeratorOrKey,
    agendaSvc.mw.search( perPage, true ),
    eventSvc.mw.cleanEvents,
    agendaSvc.mw.decorateEvents( true ),
    agendaSvc.mw.cleanJson,
    gaTrack( 'events', 'admin/export', 'json' ),
    json
  );

}

function json( req, res ) {

  cmn.renderJson( req, res, {
    total: req.total,
    offset: req.offset,
    limit: req.limit,
    events: req.formatted
  } );

}
