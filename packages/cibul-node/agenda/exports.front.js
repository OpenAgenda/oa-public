"use strict";

const sessions = require( '@openagenda/sessions' );
const tagSvc = require( '@openagenda/agenda-tags' );
const getAggLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/aggregators/sources' ) );
const categorySvc = require( '@openagenda/agenda-categories' );
const locationMw = require( '@openagenda/agenda-locations' ).mw();
const utils = require( '@openagenda/utils' );
const cbify = require( '@openagenda/utils/cbify' );
const keysSvc = require( '@openagenda/keys' );
const modLib = require( '../lib/moduleLib' );
const agendaSvc = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const eventSvc = require( '../services/event' );
const cacheMw = require( '../lib/cache.mw' );

const perPage = 20;
const routes = {

  agendaJsonEvents: [ 'get', '/events.json', [
    checkKey(),
    cacheMw.send( 'agendas', 'params.uid' ),
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    agendaSvc.mw.search( perPage ),
    eventSvc.mw.cleanEvents,
    agendaSvc.mw.decorateEvents(),
    agendaSvc.mw.cleanJson,
    cacheMw.set( 'agendas', 'agenda.uid', 30, req => JSON.stringify( {
      readme: 'Results are paginated. See: https://openagenda.zendesk.com/hc/fr/articles/203034982-L-export-JSON-d-un-agenda',
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
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
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
  ] ],

  agendaRssEvents: [ 'get', '/events.rss', [
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    agendaSvc.mw.search( 20 ),
    agendaSvc.mw.rss
  ] ],

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
    agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
    cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
    cmn.checkAdministrator( { name: 'aggregatorAgenda' } ),
    removeSource
  ] ]

};

module.exports = function ( path ) {

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

function checkKey() {

  return cbify( async ( req, res, next ) => {

    if ( !req.query.key ) {
      return _sleep( 400 )( req, res, next );
    }

    try {

      const key = await keysSvc( { key: req.query.key } ).get();

      if ( !key ) {

        return next( new Error( 'Key is invalid' ) );

      }

    } catch ( e ) {

      return next( new Error( 'Key is invalid' ) );

    }

    next();

  } );

}

function _sleep( ms ) {

  return ( req, res, next ) => {

    req.log( 'sleeping for %s milliseconds', ms );

    setTimeout( () => {

      next();

    }, ms );

  }

}

function json( req, res ) {

  cmn.renderJson( req, res, {
    readme: 'Results are paginated. See: https://openagenda.zendesk.com/hc/fr/articles/203034982-L-export-JSON-d-un-agenda',
    total: req.total,
    offset: req.offset,
    limit: req.limit,
    events: req.formatted,
  } );

}


function addSource( req, res, next ) {

  req.aggregatorAgenda.sources.add( req.agenda, ( err, result ) => {

    if ( err ) return next( err );

    if ( result.added ) {

      sessions.setFlash( req, res, getAggLabel( 'sourceAdded', {
        source: '<strong>' + req.agenda.title + '</strong>',
        agg: '<strong>' + req.aggregatorAgenda.title + '</strong>'
      }, req.lang ) );

    } else if ( result.loop ) {

      sessions.setFlash( req, res, getAggLabel( 'aggregationLoop', req.lang ) );

    }

    res.redirect( 302, req.genUrl( 'agendaShow', {
      slug: req.agenda.slug
    } ) );

  } );

}

function removeSource( req, res, next ) {

  req.aggregatorAgenda.sources.remove( req.agenda, function ( err ) {

    if ( err ) return next( err );

    sessions.setFlash( req, res, getAggLabel( 'sourceRemoved', {
      source: '<strong>' + req.agenda.title + '</strong>',
      agg: '<strong>' + req.aggregatorAgenda.title + '</strong>'
    }, req.lang ) );

    res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );

  } );

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

  req.log( 'info', { cached: 'agenda:' + req.params.uid } );

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