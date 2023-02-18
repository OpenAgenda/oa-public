'use strict';

const _ = require( 'lodash' );
const cbify = require( '@openagenda/utils/cbify' );
const keysSvc = require( '@openagenda/keys' );
const ODSJSONParser = require( '@openagenda/legacy/exports/ODSJSONParser' );
const agendaSvc = require( '../services/agenda' );
const cmn = require( '../lib/commons-app' );
const legacyEventSvc = require( '../services/event' );
const members = require( '../services/members' );
const cacheMw = require( '../lib/cache.mw' );
const gaTrack = require( '../lib/gaTrack.mw' );
const config = require( '../config' );
const convertFormat = require('./ConvertFormat');
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
      convertFormat({ sendJSON: true }),
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
