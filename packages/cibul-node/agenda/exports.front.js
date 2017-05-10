"use strict";

const modLib = require( '../lib/moduleLib' ),

  agendaSvc = require( '../services/agenda' ),

  cmn = require( '../lib/commons-app' ),

  eventSvc = require( '../services/event' ),

  sessions = require( 'sessions' ),

  tagSvc = require( 'agenda-tags' ),

  getAggLabel = require( 'labels' )( require( 'labels/aggregator-sources' ) ),

  categorySvc = require( 'agenda-categories' ),

  cacheMw = require( '../lib/cache.mw' ),

  locationMw = require( 'agenda-locations' ).mw(),

  utils = require( 'utils' ),

  perPage = 20,

  routes = {

    agendaJsonEvents: [ 'get', '/events.json', [
      cacheMw.send( 'agendas', 'params.uid' ),
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      agendaSvc.mw.search( perPage ),
      eventSvc.mw.cleanEvents,
      agendaSvc.mw.decorateEvents(),
      agendaSvc.mw.cleanJson,
      cacheMw.set( 'agendas', 'agenda.uid', 30, req => JSON.stringify( {
        total: req.total,
        offset: req.offset,
        limit: req.limit,
        events: req.formatted,
      } ) ),
      json
    ] ],

    agendaJsonLocations: [ 'get', '/locations.json', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      _prepareLocationExport,
      locationMw.list,
      ( req, res ) => cmn.renderJson( req, res, req.locations )
    ] ],

    agendaJsonSettings: [ 'get', '/settings.json', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      _loadTagSet,
      _loadCategorySet,
      locationMw.loadSettings( 'locationSettings', true ),
      ( req, res ) => cmn.renderJson( req, res, {
        tagSet: req.tagSet,
        categorSet: req.categorySet,
        locationSet: req.locationSettings,
        customSet: req.agenda.getCustomFieldsConfig()
      } )
    ] ],

    agendaCsvEvents: [ 'get', '/events.csv', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      locationMw.loadSettings( 'locationSettings' ),
      agendaSvc.mw.buildCsv( false )
    ] ],

    agendaPdfEvents: [ 'get', '/events.pdf', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      agendaSvc.mw.buildPdf
    ] ],

    agendaXlsxEvents: [ 'get', '/events.xlsx', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      locationMw.loadSettings( 'locationSettings' ),
      agendaSvc.mw.buildXlsx( false )
    ]],

    agendaRssEvents: [ 'get', '/events.rss', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      agendaSvc.mw.search( 20 ),
      agendaSvc.mw.rss
    ]],

    agendaIcsEvents: [ 'get', '/events.ics', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      agendaSvc.mw.buildIcs
    ] ],

    agendaSourceAdd: [ 'get', '/addTo/:aggUid', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
      cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
      cmn.checkAdministrator( { name: 'aggregatorAgenda' } ),
      addSource
    ] ],

    agendaSourceRemove: [ 'get', '/removeFrom/:aggUid', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
      cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
      cmn.checkAdministrator( { name: 'aggregatorAgenda' } ),
      removeSource
    ] ]

  };

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.redirectLegacySearch,
    cmn.loadLogger( 'agenda front' )
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
    events: req.formatted,
  } );

}


function addSource( req, res, next ) {

  req.aggregatorAgenda.sources.add( req.agenda, function( err ) {

    if ( err ) return next( err );

    sessions.setFlash( req, res, getAggLabel( 'sourceAdded', {
      source : '<strong>' + req.agenda.title + '</strong>',
      agg : '<strong>' + req.aggregatorAgenda.title + '</strong>'
    }, req.lang ) );

    res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );

  } );

}

function removeSource( req, res, next ) {

  req.aggregatorAgenda.sources.remove( req.agenda, function( err ) {

    if ( err ) return next( err );

    sessions.setFlash( req, res, getAggLabel( 'sourceRemoved', {
      source : '<strong>' + req.agenda.title + '</strong>',
      agg : '<strong>' + req.aggregatorAgenda.title + '</strong>'
    }, req.lang ) );

    res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );

  });

}

function _prepareLocationExport( req, res, next ) {

  utils.extend( req, { 
    agendaId: req.agenda.id,
    ignoreXhr: true,
    filterInternal: true
  } );

  next();

}

function _loadTagSet( req, res, next ) {

  tagSvc.get( req.agenda.id, ( err, tagSet ) => {

    if ( err ) return next( err );

    req.tagSet = tagSet;

    next();

  } );

}

function _loadCategorySet( req, res, next ) {

  categorySvc.get( req.agenda.id, ( err, categorySet ) => {

    if ( err ) return next( err );

    req.categorySet = categorySet;

    next();

  } );

}


function _cachedJsonResponse( cached, req, res ) {

  req.log( 'info', { cached: 'agenda:' + req.params.uid } );

  res.set( 'Content-Type', 'application/json' );

  res.send( cached );

}





function _cacheAgendaResource( req, res, next ) {

  return ( req, res, next ) => {

    sCache( 'agendas', req.agenda.uid ).set( req.url, JSON.stringify( {
      total: req.total,
      offset: req.offset,
      limit: req.limit,
      events: req.formatted,
    } ), 10, err => {

      if ( err ) {

        req.log( 'error', { cached: 'agenda:' + req.agenda.uid, error: err, action: 'set' } );

      } else {

        req.log( 'info', { cached: 'agenda:' + req.agenda.uid, action: 'set' } );

      }

    } )

    next();

  }

}