"use strict";

const _ = require( 'lodash' );
const getAggLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/aggregators/sources' ) );
const utils = require( '@openagenda/utils' );
const cbify = require( '@openagenda/utils/cbify' );
const keysSvc = require( '@openagenda/keys' );
const ODSJSONParser = require( '@openagenda/legacy/exports/ODSJSONParser' );
const agendaSvc = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const legacyEventSvc = require( '../services/event' );
const members = require( '../services/members' );
const activitiesSvc = require( '../services/activities' );
const sessions = require( '../services/sessions' );
const cacheMw = require( '../lib/cache.mw' );
const gaTrack = require( '../lib/gaTrack.mw' );
const config = require( '../config' );
const convertFormat = require('./convertFormat');
const loadCredentials = require('./loadCredentials');

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
    cacheMw('agendas', 'params.uid', 30, [
      agendaSvc.mw.load( 'uid' ),
      loadCredentials,
      convertFormat,
      cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
      agendaSvc.mw.search( perPage ),
      legacyEventSvc.mw.cleanEvents,
      agendaSvc.mw.decorateEvents(),
      agendaSvc.mw.cleanJson,
      _cacheContent,
    ]),
    gaTrack( 'events', 'export', 'json' ),
    json
  );

  app.get(
    '/agendas/:uid/settings.json',
      preMw,
      agendaSvc.mw.load( 'uid' ),
      cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
      _loadTagSet,
      _loadCategorySet,
      _loadEmbedUids,
      gaTrack( 'settings', 'export', 'json' ),
      ( req, res ) => cmn.renderJson( req, res, _.assign(
        _.pick( req.agenda, [ 'title', 'description', 'slug', 'url' ] ),
        {
          tagSet: req.tagSet,
          categorySet: req.categorySet,
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
    cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
    gaTrack( 'events', 'export', 'csv' ),
    agendaSvc.mw.buildCsv( false )
  );

  app.get(
    '/agendas/:uid/events.pdf',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
    gaTrack( 'events', 'export', 'pdf' ),
    agendaSvc.mw.buildPdf
  );

  app.get(
    '/agendas/:uid/events.xlsx',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
    gaTrack( 'events', 'export', 'xlsx' ),
    agendaSvc.mw.buildXlsx( false )
  );

  app.get(
    '/agendas/:uid/events.rss',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
    agendaSvc.mw.search( 20 ),
    gaTrack( 'events', 'export', 'rss' ),
    agendaSvc.mw.rss
  );

  app.get(
    '/agendas/:uid/events.ics',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
    gaTrack( 'events', 'export', 'ics' ),
    agendaSvc.mw.buildIcs
  );

  app.get(
    '/agendas/:uid/addTo/:aggUid',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
    agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
    cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
    members.mw.loadAndAuthorize('administrator', { agendaUidPath: 'aggregatorAgenda.uid' }),
    addSource
  );

  app.get(
    '/agendas/:uid/removeFrom/:aggUid',
    preMw,
    agendaSvc.mw.load( 'uid' ),
    cmn.ifIs( 'agenda.private', members.mw.loadOrFail ),
    agendaSvc.mw.load( 'aggUid', 'uid', { name: 'aggregatorAgenda' } ),
    cmn.checkCredential( 'aggregator', { name: 'aggregatorAgenda' } ),
    members.mw.loadAndAuthorize('administrator', { agendaUidPath: 'aggregatorAgenda.uid' }),
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

function addSource(req, res, next) {
  req.app.services.aggregators.sources.add(req.aggregatorAgenda, req.agenda).then(() => {
    sessions.setFlash(req, res, getAggLabel('sourceAdded', {
      source: '<strong>' + req.agenda.title + '</strong>',
      agg: '<strong>' + req.aggregatorAgenda.title + '</strong>'
    }, req.lang));
    res.redirect(302, `/${req.agenda.slug}`);
  });
}

function removeSource(req, res, next) {
  req.app.services.aggregators.sources.remove(req.aggregatorAgenda, req.agenda).then(() => {
    sessions.setFlash(req, res, getAggLabel('sourceRemoved', {
      source: '<strong>' + req.agenda.title + '</strong>',
      agg: '<strong>' + req.aggregatorAgenda.title + '</strong>'
    }, req.lang));
    res.redirect(302, `/${req.agenda.slug}`);
  });
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
  const member = await members.get( {
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

  const {
    legacy: {
      getTagSet
    }
  } = req.app.services;

  getTagSet(req.agenda.id).then(tagSet => {
    req.tagSet = tagSet;

    next();
  }, next);
}

function _loadCategorySet(req, res, next) {
  const {
    legacy: {
      getCategorySet
    }
  } = req.app.services;

  getCategorySet(req.agenda.id).then(categorySet => {
    req.categorySet = categorySet;
    next();
  }, next);
}


function _loadEmbedUids( req, res, next ) {

  config.knex( 'review_embed' ).select( 'uid' ).where( 'review_id', req.agenda.id ).then( rows => {

    req.embeds = rows.map( r => r.uid );

    next();

  } );

}

function _cacheContent( req, res, next ) {
  res.data = {
    settings: req.agenda.getSettings(),
    response: {
      readme: 'Results are paginated. See: https://developers.openagenda.com/export-json-dun-agenda/',
      total: req.total,
      offset: req.offset,
      limit: req.limit,
      events: req.formatted,
    }
  };

  next();
}

function json( req, res ) {

  const { response } = res.data;

  const events = !_.get( req, 'query.ods', false ) ? response.events : ODSJSONParser( req.agenda.tagSet, response.events );

  const result = {
    ...response,
    events
  };

  if (req.query.callback) {
    return res.send(req.query.callback + '(' + JSON.stringify(result) + ')');
  }

  cmn.renderJson( req, res, result );

}
