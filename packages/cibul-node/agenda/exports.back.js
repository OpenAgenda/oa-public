"use strict";

var modLib = require( '../lib/moduleLib' ),

agendaSvc = require( '../services/agenda' ),

cmn = require( '../lib/commons-app' ),

eventSvc = require( '../services/event' ),

perPage = 20,

routes = {

  agendaAdminCsvEvents: [ 'get', '/events.csv', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.buildCsv( true )
  ] ],

  agendaAdminXlsxEvents: [ 'get', '/events.xlsx', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.buildXlsx( true )
  ] ]

};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.redirectLegacySearch,
    agendaSvc.mw.load( 'uid' ),
    cmn.loadSession,
    cmn.checkAdministrator()
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}