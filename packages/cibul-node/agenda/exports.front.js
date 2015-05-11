"use strict";

var modLib = require( '../lib/moduleLib' ),

agendaSvc = require( '../services/agenda/agenda' ),

cmn = require( '../lib/commons-app' ),

eventSvc = require( '../services/event' ),

log = require( '../lib/logger' )( 'agenda exports front' ),

perPage = 20,

routes = {

  agendaJsonEvents: [ 'get', '/events.json', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.search( perPage ),
    eventSvc.mw.cleanEvents,
    agendaSvc.mw.decorateEvents(),
    json
  ] ],

  agendaCsvEvents: [ 'get', '/events.csv', cmn.loopThrough( 'page', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.search( perPage ),
    eventSvc.mw.cleanEvents,
    agendaSvc.mw.decorateEvents( false ),
    agendaSvc.mw.buildCsv( false )
  ], agendaSvc.mw.renderCsv ) ]

};

module.exports = function( path ) {

  return {
    load: modLib.Router( routes ).load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function json( req, res ) {

  cmn.renderJson( req, res, {
    events: req.formatted,
    total: req.total
  } );

}