"use strict";

const locationMw = require( '@openagenda/agenda-locations' ).mw();
const gaTrack = require( '../lib/gaTrack.mw' );
const modLib = require( '../lib/moduleLib' );
const agendaSvc = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const eventSvc = require( '../services/event' );


const perPage = 20;

const routes = {
  agendaAdminCsvEvents: [ 'get', '/events.csv', [
    cmn.checkAdminOrModeratorOrKey,
    locationMw.loadSettings( 'locationSettings' ),
    gaTrack( 'events', 'admin/export', 'csv' ),
    agendaSvc.mw.buildCsv( true )
  ] ],

  agendaAdminXlsxEvents: [ 'get', '/events.xlsx', [
    cmn.checkAdminOrModeratorOrKey,
    locationMw.loadSettings( 'locationSettings' ),
    gaTrack( 'events', 'admin/export', 'xlsx' ),
    agendaSvc.mw.buildXlsx( true )
  ] ],

  agendaAdminRssEvents: [ 'get', '/events.rss', [
    cmn.checkAdminOrModeratorOrKey,
    agendaSvc.mw.search( perPage, true ),
    gaTrack( 'events', 'admin/export', 'rss' ),
    agendaSvc.mw.rss
  ] ],

  agendaAdminJsonEvents: [ 'get', '/events.json', [
    cmn.checkAdminOrModeratorOrKey,
    agendaSvc.mw.search( perPage, true ),
    eventSvc.mw.cleanEvents,
    agendaSvc.mw.decorateEvents( true ),
    agendaSvc.mw.cleanJson,
    gaTrack( 'events', 'admin/export', 'json' ),
    json
  ] ]
};

module.exports = function ( path ) {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.redirectLegacySearch,
    agendaSvc.mw.load( 'uid' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function json( req, res ) {

  cmn.renderJson( req, res, {
    total: req.total,
    offset: req.offset,
    limit: req.limit,
    events: req.formatted
  } );

}
