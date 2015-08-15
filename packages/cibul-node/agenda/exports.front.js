"use strict";

var modLib = require( '../lib/moduleLib' ),

agendaSvc = require( '../services/agenda' ),

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
    agendaSvc.mw.cleanJson,
    json
  ] ],

  agendaCsvEvents: [ 'get', '/events.csv', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.buildCsv( false )
  ] ],

  agendaSourceAdd: [ 'get', '/addTo/:aggUid', [
    cmn.flashSetter,
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
    cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
    cmn.checkAdministrator( { name: 'aggregatorAgenda' } ),
    addSource
  ] ],

  agendaSourceRemove: [ 'get', '/removeFrom/:aggUid', [
    cmn.flashSetter,
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
    cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
    cmn.checkAdministrator( { name: 'aggregatorAgenda' } ),
    removeSource
  ] ]

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

function addSource( req, res, next ) {

  req.aggregatorAgenda.sources.add( req.agenda, function( err ) {

    if ( err ) return next( err );

    res.setFlash( req, '%source% was added to the sources of %agg%. Its upcoming events will be added shortly.', {
      '%source%' : '<strong>' + req.agenda.title + '</strong>',
      '%agg%' : '<strong>' + req.aggregatorAgenda.title + '</strong>'
    } );

    res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );

  });

}

function removeSource( req, res, next ) {

  req.aggregatorAgenda.sources.remove( req.agenda, function( err ) {

    if ( err ) return next( err );

    res.setFlash( req, '%source% was removed from the sources of %agg%.', {
      '%source%' : '<strong>' + req.agenda.title + '</strong>',
      '%agg%' : '<strong>' + req.aggregatorAgenda.title + '</strong>'
    } );

    res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );

  });

}