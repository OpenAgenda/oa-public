"use strict";

const config = require( '../config' );

const _ = require( 'lodash' );
const cmn = require( '../lib/commons-app' );
const qs = require( 'qs' );

const controlDataSvc = require( '../services/legacy' ).controlData;
const sessions = require( '@openagenda/sessions' );
const utils = require( '@openagenda/utils' );

const agendaSvc = require('@openagenda/agendas');
const legacyAgendaSvc = require('../services/agenda');
const legacyEventSvc = require('../services/event');
const legacyEventSearch = require('../services/elasticsearch');
const formOrderMw = require( './formOrder.mw.js' );

const customSvc = require('@openagenda/custom');

const logger = require('@openagenda/logs');

const apiLog = logger( 'legacyApi' );
const log = logger( 'legacy' );

const adminLayout = require( '../services/lib/layouts' ).agendaAdmin;

module.exports = app => {

  const { agendas } = app.services;

  const preMw = [
    cmn.loadLogger( 'legacy' ),
    _checkLocalhost
  ];

  app.post(
    '/legacy/:slug/admin/layout/:tab',
    preMw,
    _loadAgenda,
    agendas.mw.authorizeByIPAddress(),
    agendaAdminLayout
  );

  app.get(
    '/legacy/events/:eventUid/create',
    preMw,
    _loadOptionalAgenda,
    _loadEventByUid,
    eventCreate
  );

  app.get(
    '/legacy/events/:eventUid/update',
    preMw,
    _loadOptionalAgenda,
    _loadEventByUid,
    eventUpdate
  );

  app.get(
    '/legacy/api',
    preMw,
    api
  );

  app.get(
    '/legacy/api/cache',
    preMw,
    apiGetCached
  );

  app.post(
    '/legacy/api/cache',
    preMw,
    apiPostCached
  );

  app.post(
    '/legacy/api/system',
    preMw,
    apiSystem
  );

  

  /**
   * process an event delete
   */
  app.get(
    '/legacy/events/:eventUid/delete',
    preMw,
    _loadEventByUid,
    eventDelete
  );

  app.get(
    '/legacy/:slug/credentials',
    preMw,
    _loadAgenda,
    ( req, res ) => res.json( req.agenda.credentials )
  );

  /**
   * log sf messages
   */
  app.post(
    '/legacy/log',
    logController
  );

  app.get(
    '/legacy/:slug/form-order',
    preMw,
    legacyAgendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
    formOrderMw
  );

  app.get(
    '/legacy/embeds/:embedUid/clear',
    preMw,
    ( req, res, next ) => {

      res.send( 'ok' );

      controlDataSvc.embedClear( req.params.embedUid ).then( () => {

        req.log( 'embed ctl data clear complete' );

      }, err => {

        req.log( 'error', 'embed ctl data clear failed', err );

      } );

    }
  );

  app.post(
    '/legacy/notifications',
    preMw,
    ( req, res ) => {

      cmn.renderJson( req, res, { success: true } );

    }
  );

  app.post(
    '/legacy/contributor/ip',
    preMw,
    ( req, res, next ) => {

      agendaSvc.get( { uid: req.body.agendaUid }, { private: null }, ( err, agenda ) => {

        if ( err ) return next( err );

        if ( !agenda ) return next( new Error( 'Agenda not found: ' + req.body.agendaUid ) );

        const authorizedIPs = agenda.settings.contribution.authorizedIPAddresses;

        if ( !authorizedIPs || !authorizedIPs.length || (req.body.ip === '127.0.0.1' && process.env.NODE_ENV === 'development') ) {

          return res.json( { authorized: true } );

        }

        if ( authorizedIPs.filter( ip => req.body.ip === ip ).length ) {

          return res.json( { authorized: true } );

        }

        res.json( {
          authorized: false
        } );

      } );

    }
  );

  /**
   * provide session data to sf
   */
  app.get(
    '/legacy/session',
    preMw,
    session
  );

}

function agendaAdminLayout( req, res ) {

  const { scriptParams, scripts, role } = req.body;

  res.send( adminLayout( '{content}', {
    role,
    agenda: req.agenda,
    lang: req.lang,
    selectedTab: req.params.tab,
    bodyAttributes: [ {
      name: 'data-options',
      value: JSON.stringify( scriptParams )
    } ],
    scripts
  } ) );

}

function _loadEventByUid( req, res, next ) {

  legacyEventSvc.get( { uid: req.params.eventUid }, ( err, event ) => {

    if ( err ) return next( err );

    if ( !event ) return next( new Error( 'no event found' ) );

    req.event = event;

    next();

  } );

}


function api( req, res ) {

  res.send( 'ok' );

  if ( req.query.uri ) {

    const parts = req.query.uri.split( '?' );

    const path = parts.shift();

    let query = {};

    if ( parts.length ) {

      query = qs.parse( parts[ 0 ] );

    }

    apiLog( 'info', _.extend( {
      message: req.query.uri,
      uri: req.query.uri,
      path
    }, query ) );

  }

}


function apiGetCached( req, res, next ) {

  const cleanUri = _cleanApiUri( req );

  if ( _isAgendaEventsApiUri( req.query.uri ) ) {

    req.app.services.simpleCache( 'agendas', _getAgendaUidFromAgendaEventsApiUri( cleanUri ) ).get( cleanUri, ( err, content ) => {

      if ( content ) {

        req.log( 'providing cached response for uri %s: stored as %s', req.query.uri, cleanUri );

        res.send( content );

      } else {

        res.send( null );

      }

    } );

  } else {

    req.app.services.simpleCache( 'legacyApi', '*' ).get( cleanUri, ( err, content ) => {

      if ( content ) {

        req.log( 'providing cached response for uri %s: stored as %s', req.query.uri, cleanUri );

        res.send( content );

      } else {

        res.send( null );

      }

    } );

  }


}


async function _updateAgendaEvents({ agendaEvents }, { eventId } ) {

  const refs = await config.knex( 'review_article' ).select( 'review_id' ).where( 'event_id', eventId );

  for (const ref of refs) {
    await agendaEvents.legacyTransfer({
      agendaId: ref.review_id,
      eventId
    });
  }

}


async function apiSystem( req, res, next ) {

  try {

    const systemEvent = _.get( req.body, 'name' );

    const values = _.get( req.body, 'values' );

    if ( systemEvent === 'event.update' ) {

      await _updateAgendaEvents(req.app.services, { eventId: values.id });

    } else {

      req.log( 'error', 'unknown system event', systemEvent );

    }

  } catch ( e ) {

    req.log( 'error', 'api system message fail', e );

  }

  res.send( null );

}


function apiPostCached( req, res, next ) {

  const cleanUri = _cleanApiUri( req ), ttl = 60 * 60;

  if ( _isAgendaEventsApiUri( req.query.uri ) ) {

    req.app.services.simpleCache( 'agendas', _getAgendaUidFromAgendaEventsApiUri( cleanUri ) ).set( cleanUri, req.body.toCache, ttl, err => {

      req.log( 'storing cached response for uri %s as %s', req.query.uri, cleanUri );

      res.send( null );

    } );

  } else {

    req.app.services.simpleCache( 'legacyApi', '*' ).set( cleanUri, JSON.stringify( req.body.toCache ), ttl, err => {

      req.log( 'storing cached response for uri %s as %s', req.query.uri, cleanUri );

      return res.send( null );

    } );

  }


}

function _cleanApiUri( req ) {

  const parts = req.query.uri.split( '?' );

  const path = parts.shift();

  let query = {}

  if ( parts.length ) {

    query = _.omit( qs.parse( parts[ 0 ] ), [ 'key', 'callback' ] );

  }

  return path + '?' + qs.stringify( query );

}

function _isAgendaEventsApiUri( uri ) {

  return !!uri.split( '?' )[ 0 ].match( /\/v1\/agendas\/[0-9]+\/events$/ );

}

function _getAgendaUidFromAgendaEventsApiUri( uri ) {

  return parseInt( uri.split( '?' )[ 0 ].match( /[^\/][0-9]+[^\/]/ ) );

}


function session( req, res, next ) {

  sessions.get( req, { detailed: true }, ( err, user ) => {

    if ( err ) return next( err );

    res.send( user );

  } );

}


function eventDelete( req, res, next ) {
  res.send( 'ok' );

  const userUid = req.query.userUid || null;
  const agendaUid = req.query.agendaUid || null;

  req.app.services.core.agendas(agendaUid).events.remove(req.event.uid).then( () => {
    log('deleted event', req.event.uid);
  }, err => {
    log('error', err);
  });

}


async function eventUpdate(req, res, next) {
  log('legacy event updated, updating event');

  if (!req.agenda) {
    log('error', 'agenda not specified at legacy event update');
    return next();
  }

  try {
    await _transferFromLegacy(req.app.services, {
      legacyEvent: req.event,
      agenda: req.agenda,
      userUid: req.query.userUid
    });
  } catch(e) {
    log('error', 'legacy update', e);
    return next(e);
  }

  res.send('ok');
}


async function eventCreate(req, res, next) {
  log('legacy event created, creating event');

  if (!req.agenda) {
    log('error', 'agenda not specified at legacy event create');
    return next();
  }

  try {
    await _transferFromLegacy(req.app.services, {
      legacyEvent: req.event,
      agenda: req.agenda,
      userUid: req.query.userUid
    });
  } catch(e) {
    log('error', 'legacy create', e);
    return next(e);
  }

  res.send('ok');
}

async function _transferFromLegacy(services, { legacyEvent, agenda, userUid }) {
  const {
    events
  } = services;

  try {
    await events.setFromLegacy({ uid: legacyEvent.uid });
  } catch (e) {
    log('error', e);
    throw new Error('could not transfer legacy event');
  }

  log('creating agendaEvent from legacy', { agendaId: agenda.id, eventId: legacyEvent.id })
  await services.agendaEvents.legacyTransfer({
    agendaId: agenda.id,
    eventId: legacyEvent.id
  }, {
    context: {
      userUid,
      event,
      agenda
    }
  });

  if (agenda.formSchemaId) {
    try {
      await customSvc(agenda.formSchemaId).transferFromLegacy(event.uid, _.get(agenda, 'id'));
    } catch (e) {
      log( 'error', 'could not transfer custom data from legacy (%s.%s)', agenda.uid, event.uid, e );
    }
  }

  try {
    await legacyEventSearch.updateEvent(_.pick(event, ['uid']));
  } catch ( e ) {
    log('error', 'could not update legacy search for event %s', event.slug );
  }
}

function logController( req, res, next ) {

  if ( req.body && typeof req.body == 'object' ) {

    try {

      if ( req.body.level === 'info' ) {

        log( 'info', utils.extend( {
          origin: 'symfony',
        }, req.body ) );

      } else {

        log( utils.extend( {
          origin: 'symfony',
        }, req.body ) );

      }

    } catch ( e ) {

      log( 'error', { origin: 'sf log', body: JSON.stringify( req.body ) } )

    }

  }

  cmn.renderJson( req, res, { success: true } );

}

function _checkLocalhost( req, res, next ) {

  // can't think of anything more strict, so
  // lets just block legacy queries at the nginx level
  if ( req.header( 'x-forwarded-for' ) ) {

    return next( new Error( 'Not allowed.' ) );

  }

  next();

}


function _cleanRecipients( recipients ) {

  var clean = [];

  if ( utils.isArray( recipients ) ) {

    recipients.forEach( r => {

      let emails = _extractRecipients( r );

      clean = clean.concat( emails );

    } );

  } else if ( typeof recipients == 'object' ) {

    clean = _extractRecipients( recipients );

  }

  return clean;

}

function _loadOptionalAgenda( req, res, next ) {

  if ( !req.query.agendaUid ) return next();

  agendaSvc.get( { uid: req.query.agendaUid }, { internal: true, private: null }, ( err, agenda ) => {

    if ( err ) return next( err );

    req.agenda = agenda;

    next();

  } );

}

function _extractRecipients( obj ) {

  let emails = [];

  for ( let email in obj ) emails.push( email );

  return emails;

}

function _loadAgenda( req, res, next ) {

  agendaSvc.get( _.pick( req.params, [ 'slug' ] ), {
    private: null,
    internal: true,
    includeImagePath: true
  } ).then( agenda => {

    if ( !agenda ) return next( { code: 404 } );

    _.assign( req, { agenda } );

    next();

  }, next );

}
