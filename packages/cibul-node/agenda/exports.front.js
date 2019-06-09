"use strict";

const _ = require( 'lodash' );

const config = require( '../config' );

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
const gaTrack = require( '../lib/gaTrack.mw' );

const ODSJSONParser = require( '@openagenda/legacy/exports/ODSJSONParser' );

const perPage = 20;
const routes = {

  agendaJsonEvents: [ 'get', '/events.json', [
    checkKey(),
    cacheMw.send( 'agendas', 'params.uid', cachedJson ),
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    agendaSvc.mw.search( perPage ),
    eventSvc.mw.cleanEvents,
    agendaSvc.mw.decorateEvents(),
    agendaSvc.mw.cleanJson,
    cacheMw.set( 'agendas', 'params.uid', 30, _cacheContent ),
    gaTrack( 'events', 'export', 'json' ),
    json
  ] ],

  agendaJsonLocations: [ 'get', '/locations.json', [
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    _prepareLocationExport,
    locationMw.list,
    gaTrack( 'locations', 'export', 'json' ),
    ( req, res ) => cmn.renderJson( req, res, req.locations )
  ] ],

  agendaJsonSettings: [
    'get', '/settings.json', [
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      _loadTagSet,
      _loadCategorySet,
      _loadEmbedUids,
      locationMw.loadSettings( 'locationSettings', true ),
      gaTrack( 'settings', 'export', 'json' ),
      ( req, res ) => cmn.renderJson( req, res, _.assign(
        _.pick( req.agenda, [ 'title', 'description', 'slug', 'url' ] ),
        {
          tagSet: req.tagSet,
          categorSet: req.categorySet,
          locationSet: req.locationSettings,
          customSet: req.agenda.getCustomFieldsConfig(),
          embeds: req.embeds
        }
      ) )
    ]
  ],

  agendaCsvEvents: [ 'get', '/events.csv', [
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    locationMw.loadSettings( 'locationSettings' ),
    gaTrack( 'events', 'export', 'csv' ),
    agendaSvc.mw.buildCsv( false )
  ] ],

  agendaPdfEvents: [ 'get', '/events.pdf', [
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    gaTrack( 'events', 'export', 'pdf' ),
    agendaSvc.mw.buildPdf
  ] ],

  agendaXlsxEvents: [ 'get', '/events.xlsx', [
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    locationMw.loadSettings( 'locationSettings' ),
    gaTrack( 'events', 'export', 'xlsx' ),
    agendaSvc.mw.buildXlsx( false )
  ] ],

  agendaRssEvents: [ 'get', '/events.rss', [
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    agendaSvc.mw.search( 20 ),
    gaTrack( 'events', 'export', 'rss' ),
    agendaSvc.mw.rss
  ] ],

  agendaIcsEvents: [ 'get', '/events.ics', [
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    gaTrack( 'events', 'export', 'ics' ),
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

  const router = modLib.Router( routes );

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

  const events = !_.get( req, 'query.ods', false ) ? req.formatted : ODSJSONParser( req.agenda.tagSet, req.formatted );

  cmn.renderJson( req, res, {
    readme: 'Results are paginated. See: https://openagenda.zendesk.com/hc/fr/articles/203034982-L-export-JSON-d-un-agenda',
    total: req.total,
    offset: req.offset,
    limit: req.limit,
    events,
  } );

}

function cachedJson( cached, req ) {

  const parsedCache = JSON.parse( cached );

  _.set( req, 'agenda', {
    uid: req.params.uid,
    settings: cached.settings
  } );

  gaTrack( 'events', 'export', 'json' )( req );

  res.set( 'Content-Type', 'application/json' );

  res.send( parsedCache.response );
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


function _loadEmbedUids( req, res, next ) {

  config.knex( 'review_embed' ).select( 'uid' ).where( 'review_id', req.agenda.id ).then( rows => {

    req.embeds = rows.map( r => r.uid );

    next();

  } );

}

function _cacheContent( req ) {

  return JSON.stringify( {
    settings: req.agenda.getSettings(),
    response: {
      readme: 'Results are paginated. See: https://openagenda.zendesk.com/hc/fr/articles/203034982-L-export-JSON-d-un-agenda',
      total: req.total,
      offset: req.offset,
      limit: req.limit,
      events: req.formatted,
    }
  } );

}
