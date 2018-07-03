"use strict";

const modLib = require( '../lib/moduleLib' ),

  agendaSvc = require( '../services/agenda' ),

  cmn = require( '../lib/commons-app' ),

  eventSvc = require( '../services/event' ),

  locationMw = require( '@openagenda/agenda-locations' ).mw(),

  perPage = 20,

  routes = {

    agendaAdminCsvEvents: [ 'get', '/events.csv', [
      cmn.checkAdminOrModeratorOrKey,
      locationMw.loadSettings( 'locationSettings' ),
      agendaSvc.mw.buildCsv( true )
    ] ],

    agendaAdminXlsxEvents: [ 'get', '/events.xlsx', [
      cmn.checkAdminOrModeratorOrKey,
      locationMw.loadSettings( 'locationSettings' ),
      agendaSvc.mw.buildXlsx( true )
    ] ],

    agendaAdminRssEvents: [ 'get', '/events.rss', [
      cmn.checkAdminOrModeratorOrKey,
      agendaSvc.mw.search( perPage, true ),
      agendaSvc.mw.rss
    ] ],

    agendaAdminJsonEvents: [ 'get', '/events.json', [
      cmn.checkAdminOrModeratorOrKey,
      agendaSvc.mw.search( perPage, true ),
      eventSvc.mw.cleanEvents,
      agendaSvc.mw.decorateEvents( true ),
      agendaSvc.mw.cleanJson,
      json
    ] ]

  };

module.exports = function( path ) {

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