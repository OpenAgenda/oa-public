"use strict";

var modLib = require( '../lib/moduleLib' ),

agendaSvc = require( '../services/agenda' ),

cmn = require( '../lib/commons-app' ),

eventSvc = require( '../services/event' ),

tagSvc = require( 'agenda-tags' ),

categorySvc = require( 'agenda-categories' ),

locationMw = require( 'agenda-locations' ).mw(),

utils = require( 'utils' ),

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

  agendaJsonLocations: [ 'get', '/locations.json', [
    agendaSvc.mw.load( 'uid' ),
    _prepareLocationExport,
    locationMw.list,
    ( req, res ) => cmn.renderJson( req, res, req.locations )
  ] ],

  agendaJsonSettings: [ 'get', '/settings.json', [
    agendaSvc.mw.load( 'uid' ),
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
    locationMw.loadSettings( 'locationSettings' ),
    agendaSvc.mw.buildCsv( false )
  ] ],

  agendaPdfEvents: [ 'get', '/events.pdf', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.buildPdf
  ] ],

  agendaXlsxEvents: [ 'get', '/events.xlsx', [
    agendaSvc.mw.load( 'uid' ),
    locationMw.loadSettings( 'locationSettings' ),
    agendaSvc.mw.buildXlsx( false )
  ]],

  agendaRssEvents: [ 'get', '/events.rss', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.search( 20 ),
    agendaSvc.mw.rss
  ]],

  agendaIcsEvents: [ 'get', '/events.ics', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.buildIcs
  ] ],

  agendaSourceAdd: [ 'get', '/addTo/:aggUid', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
    cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
    cmn.checkAdministrator( { name: 'aggregatorAgenda' } ),
    addSource
  ] ],

  agendaSourceRemove: [ 'get', '/removeFrom/:aggUid', [
    agendaSvc.mw.load( 'uid' ),
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