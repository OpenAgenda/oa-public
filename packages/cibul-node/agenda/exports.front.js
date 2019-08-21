"use strict";

const _ = require( 'lodash' );
const sessions = require( '@openagenda/sessions' );
const tagSvc = require( '@openagenda/agenda-tags' );
const getAggLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/aggregators/sources' ) );
const categorySvc = require( '@openagenda/agenda-categories' );
const locationMw = require( '@openagenda/agenda-locations' ).mw();
const utils = require( '@openagenda/utils' );
const cbify = require( '@openagenda/utils/cbify' );
const keysSvc = require( '@openagenda/keys' );
const ODSJSONParser = require( '@openagenda/legacy/exports/ODSJSONParser' );
const agendaSvc = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const eventSvc = require( '../services/event' );
const membersSvc = require( '../services/members' );
const activitiesSvc = require( '../services/activities' );
const cacheMw = require( '../lib/cache.mw' );
const gaTrack = require( '../lib/gaTrack.mw' );
const config = require( '../config' );


const perPage = 20;

const preMw = [
  cmn.redirectLegacySearch,
  cmn.loadLogger( 'agenda front' )
];


module.exports = app => {

  app.options( '*/events.json*', ( req, res ) => res.sendStatus(200) );

  app.get(
    '/agendas/:uid/events.json',
    preMw,
    _checkKey( ( req, res, next ) => res.status( 400 ).json( { error: 'Provided key is invalid' } ) ),
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
  );

  app.get(
    '/agendas/:uid/locations.json',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    _prepareLocationExport,
    locationMw.list,
    gaTrack( 'locations', 'export', 'json' ),
    ( req, res ) => cmn.renderJson( req, res, req.locations )
  );

  app.get(
    '/agendas/:uid/settings.json',
          preMw,
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
  );

  app.get(
    '/agendas/:uid/events.csv',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    locationMw.loadSettings( 'locationSettings' ),
    gaTrack( 'events', 'export', 'csv' ),
    agendaSvc.mw.buildCsv( false )
  );

  app.get(
    '/agendas/:uid/events.pdf',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    gaTrack( 'events', 'export', 'pdf' ),
    agendaSvc.mw.buildPdf
  );

  app.get(
    '/agendas/:uid/events.xlsx',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    locationMw.loadSettings( 'locationSettings' ),
    gaTrack( 'events', 'export', 'xlsx' ),
    agendaSvc.mw.buildXlsx( false )
  );

  app.get(
    '/agendas/:uid/events.rss',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    agendaSvc.mw.search( 20 ),
    gaTrack( 'events', 'export', 'rss' ),
    agendaSvc.mw.rss
  );

  app.get(
    '/agendas/:uid/events.ics',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    gaTrack( 'events', 'export', 'ics' ),
    agendaSvc.mw.buildIcs
  );

  app.get(
    '/agendas/:uid/addTo/:aggUid',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
    cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
    cmn.checkAdministrator( { name: 'aggregatorAgenda' } ),
    addSource
  );

  app.get(
    '/agendas/:uid/removeFrom/:aggUid',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
    agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
    cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
    cmn.checkAdministrator( { name: 'aggregatorAgenda' } ),
    removeSource
  );

};

function _checkKey( onError ) {

  return cbify( async ( req, res, next ) => {

    if ( !req.query.key ) {

      return _sleep( 400 )( req, res, next );

    }

    try {

      const key = await keysSvc( { key: req.query.key } ).get();

      if ( !key ) {

        return onError( req, res, next );

      }

    } catch ( e ) {

      return onError( req, res, next );

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

function cachedJson( cached, req, res ) {

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

  req.aggregatorAgenda.sources.add( req.agenda, async ( err, result ) => {

    if ( err ) return next( err );

    if ( result.added ) {

      sessions.setFlash( req, res, getAggLabel( 'sourceAdded', {
        source: '<strong>' + req.agenda.title + '</strong>',
        agg: '<strong>' + req.aggregatorAgenda.title + '</strong>'
      }, req.lang ) );

      let entities = {};

      try {
        const { user, member, agenda, source } = entities = await loadNeedsForActivity( req );

        await addSourceAddActivity( { user, member, agenda, source } );
      } catch ( e ) {
        req.log( 'error', 'failed adding activity of type agenda.addSource', { member: entities.member, exception: e } );
      }

    } else if ( result.loop ) {

      sessions.setFlash( req, res, getAggLabel( 'aggregationLoop', req.lang ) );

    }

    res.redirect( 302, req.genUrl( 'agendaShow', {
      slug: req.agenda.slug
    } ) );

  } );

}

function removeSource( req, res, next ) {

  req.aggregatorAgenda.sources.remove( req.agenda, async err => {

    if ( err ) return next( err );

    let entities = {};

    try {
      const { user, member, agenda, source } = entities = await loadNeedsForActivity( req );

      await addRemoveSourceActivity( { user, member, agenda, source } );
    } catch ( e ) {
      req.log( 'error', 'failed adding activity of type agenda.removeSource', { member: entities.member, exception: e } );
    }

    sessions.setFlash( req, res, getAggLabel( 'sourceRemoved', {
      source: '<strong>' + req.agenda.title + '</strong>',
      agg: '<strong>' + req.aggregatorAgenda.title + '</strong>'
    }, req.lang ) );

    res.redirect( 302, req.genUrl( 'agendaShow', { slug: req.agenda.slug } ) );

  } );

}

async function addSourceAddActivity( { user, member, agenda, source } ) {
  activitiesSvc.feed( {
    entityType: 'agenda',
    entityUid: agenda.uid
  } ).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'agenda.addSource',
    object: 'agenda:' + source.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: member.custom.contactName || user.fullName,
        object: source.title,
        target: agenda.title
      }
    }
  } );
}

async function addRemoveSourceActivity( { user, member, agenda, source } ) {
  activitiesSvc.feed( {
    entityType: 'agenda',
    entityUid: agenda.uid
  } ).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'agenda.removeSource',
    object: 'agenda:' + source.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: member.custom.contactName || user.fullName,
        object: source.title,
        target: agenda.title
      }
    }
  } );
}

async function loadNeedsForActivity( req ) {
  const member = await membersSvc.get( {
    agendaUid: req.aggregatorAgenda.uid,
    userUid: req.user.uid
  } );

  if ( !member ) {
    throw new Error( 'Cannot found member' );
  }

  return {
    user: req.user,
    agenda: req.aggregatorAgenda,
    member,
    source: req.agenda
  };
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
