"use strict";

var modLib = require( '../lib/moduleLib' ),

agendaSvc = require( '../services/agenda' ),

cmn = require( '../lib/commons-app' ),

eventSvc = require( '../services/event' ),

perPage = 20,

routes = {

  agendaAdminCsvEvents: [ 'get', '/events.csv', [
    cmn.checkAdminOrModeratorOrKey,
    agendaSvc.mw.buildCsv( true )
  ] ],

  agendaAdminXlsxEvents: [ 'get', '/events.xlsx', [
    cmn.checkAdminOrModeratorOrKey,
    agendaSvc.mw.buildXlsx( true )
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

  var router = modLib.Router( routes );

  router.pre( [
    cmn.redirectLegacySearch,
    agendaSvc.mw.load( 'uid' ),
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function json( req, res ) {

  cmn.renderJson( req, res, {
    events: req.formatted,
    total: req.total
  } );

}