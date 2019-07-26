"use strict";

const config = require( '../config' );

const _ = require( 'lodash' );
const async = require( 'async' );
const cmn = require( '../lib/commons-app' );
const qs = require( 'qs' );

const activitiesSvc = require( '@openagenda/activities' );
const agendaEventsSvc = require( '../services/agendaEvents' );
const controlDataSvc = require( '../services/legacy' ).controlData;
const sessions = require( '@openagenda/sessions' );
const referencesSvc = require( '@openagenda/agenda-event-references' );
const sCache = require( '@openagenda/simple-cache' );
const utils = require( '@openagenda/utils' );

const agendaSvc = require( '@openagenda/agendas' );
const legacyAgendaSvc = require( '../services/agenda' );
const legacyEventSvc = require( '../services/event' );
const formOrderMw = require( './formOrder.mw.js' );
const formFieldsByUser = require( './formFieldsByUser.mw.js' );
const legacyEvents = require( '../services/events' ).legacy;

const agendaLocations = require( '@openagenda/agenda-locations' );

const setMemberUidAndSlugRefs = require( '../services/agendaStakeholders/lib/setMemberUidAndSlugRefs' );

const logger = require( '@openagenda/logs' );

const apiLog = logger( 'legacyApi' );
const log = logger( 'legacy' );

const adminLayout = require( '../services/lib/layouts' ).agendaAdmin;

const preMw = [
  cmn.loadLogger( 'legacy' ),
  _checkLocalhost
];


module.exports = app => {

  /**
   * provide to sf the html of the head section of an agenda
   */
  app.get(
    '/legacy/:slug/head',
    preMw,
    legacyAgendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
    head
  );

  app.post(
    '/legacy/members/sync',
    preMw,
    syncMember
  );

  app.post(
    '/legacy/:slug/admin/layout/:tab',
    preMw,
    _loadAgenda,
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
    '/legacy/api/agendas/:agendaUid/locations/:locationUid/sync',
    preMw,
    locationSync
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
   * process a save for event references
   */
  app.post(
    '/legacy/:slug/events/:eventUid/references',
    preMw,
    legacyAgendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
    _loadEventByUid,
    referencesSave
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
    '/legacy/:slug/form-fields/:userUid',
    preMw,
    legacyAgendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
    formFieldsByUser
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

  /**
   * send mails on behalf of sf
   */
  app.post(
    '/legacy/mail',
    preMw,
    mail
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


/**
 * give a rendered header of agenda
 */

function head( req, res, next ) {

  agendaSvc.get( { uid: req.agenda.uid }, { private: null }, ( err, agenda ) => {

    cmn.render( req, res, 'agenda/headPart', {
      mailto: cmn.agendaMailTo( req.agenda ),
      agenda: req.agenda,
      includeActionLinks: true,
      targetBlank: true
    } );

  } );

}

function syncMember( req, res, next ) {

  res.send( 'ok' );

  setMemberUidAndSlugRefs( req.body );

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

    if ( !event ) return next( 'no event found' );

    req.event = event;

    next();

  } );

}


function referencesSave( req, res, next ) {

  req.log( 'received request to save references for uids %s', req.body.uids );

  req.agenda.search( { uids: req.body.uids || [] }, { showAll: true, limit: 150 }, ( err, result ) => {

    if ( err ) return next( err );

    req.log( 'events added as reference: %s', result.events.map( e => e.slug + ':' + e.id ).join( ',' ) );

    const refIds = result.events.map( e => parseInt( e.id.split( '@' )[ 0 ] ) );

    referencesSvc( req.agenda.id ).set( req.event.id, refIds, err => {

      req.log( 'references for event %s set: %s', req.event.id, refIds.join( ', ' ) );

      res.send( 'ok' );

    } );

  } );

}


function locationSync( req, res ) {

  agendaLocations.get( { uid: req.params.locationUid }, { instanciate: false }, ( err, location ) => {

    if ( err ) {

      return req.log( 'error', 'locationSync.get', req.params.locationUid, err );

    }

    if ( !location ) {

      return req.log( 'error', 'locationSync.get', req.params.locationUid, 'no location found' );

    }

    agendaLocations.set( location, { forceIndexCreate: true }, ( err, result ) => {

      if ( err ) return req.log( 'error', 'locationSync.set', req.params.locationUid, err );

      req.log( 'info', 'locationSync done for location %s', req.params.locationUid );

    } );

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

    sCache( 'agendas', _getAgendaUidFromAgendaEventsApiUri( cleanUri ) ).get( cleanUri, ( err, content ) => {

      if ( content ) {

        req.log( 'providing cached response for uri %s: stored as %s', req.query.uri, cleanUri );

        res.send( content );

      } else {

        res.send( null );

      }

    } );

  } else {

    sCache( 'legacyApi', '*' ).get( cleanUri, ( err, content ) => {

      if ( content ) {

        req.log( 'providing cached response for uri %s: stored as %s', req.query.uri, cleanUri );

        res.send( content );

      } else {

        res.send( null );

      }

    } );

  }


}


async function _updateAgendaEvents( { eventId } ) {

  const refs = await config.knex( 'review_article' ).select( 'review_id' ).where( 'event_id', eventId );

  for ( const ref of refs ) {

    await agendaEventsSvc.legacy.evaluate( {
      name: 'event.update',
      values: {
        id: eventId,
        agendaId: ref.review_id,
        force: true
      }
    } );

  }

}


async function apiSystem( req, res, next ) {

  try {

    const systemEvent = _.get( req.body, 'name' );

    const values = _.get( req.body, 'values' );

    if ( systemEvent === 'event.update' ) {

      await _updateAgendaEvents( { eventId: values.id } );

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

    sCache( 'agendas', _getAgendaUidFromAgendaEventsApiUri( cleanUri ) ).set( cleanUri, req.body.toCache, ttl, err => {

      req.log( 'storing cached response for uri %s as %s', req.query.uri, cleanUri );

      res.send( null );

    } );

  } else {

    sCache( 'legacyApi', '*' ).set( cleanUri, JSON.stringify( req.body.toCache ), ttl, err => {

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

  log( 'received request to delete event %s from user %s on agenda %s', req.event.uid, userUid, agendaUid );

  req.event.getAgendaReferences( ( err, agendas ) => {

    async.eachSeries( agendas, ( a, ecb ) => {

      legacyAgendaSvc.get( { uid: a.uid }, ( err, agenda ) => {

        agenda.removeEvent( req.event, ecb );

      } );

    }, err => {

      legacyEvents.onRemove( req.event, { userUid, agendaUid }, err => {

        if ( err ) {

          log( 'error', 'event %s could not be removed: %s', req.event.id, err );

        }

        req.event.remove( err => {

          if ( err ) {

            log( 'error', 'event %s could not be removed: %s', req.event.id, err );

          } else {

            log( 'info', 'event %s removed', req.event.id );

          }

          activitiesSvc.feed( { entityType: 'event', entityUid: req.event.uid } ).remove( () => {

            req.log( 'event %s feed removed', req.event.id );

          } );

        } );

      } );

    } );

  } );

}


function eventUpdate( req, res, next ) {

  res.send( 'ok' );

  req.log( 'event %s ( %s ) was updated', req.event.uid, req.event.slug );

  legacyEvents.onUpdate( req.event, {
    userUid: req.query.userUid || null,
    agendaUid: req.query.agendaUid || null,
    agenda: req.agenda
  } );

}


function eventCreate( req, res, next ) {

  req.log( 'event was created' );

  res.send( 'ok' );

  legacyEvents.onCreate( req.event, {
    userUid: req.query.userUid || null,
    agendaUid: req.query.agendaUid || null,
    agenda: req.agenda
  } );

  if ( !req.agenda ) return;

  req.event.loadAgendaCustomContext( {
    uid: req.agenda.uid,
    customFields: _.get( req, 'agenda.legacyStore.customFields', [] )
  } );

  req.event.evaluateCustomImageDuplication( err => err ? req.log( 'error', err ) : null )

}


/*

  mail things received from symfony.

  sample: {
    recipient: { 'gaetan@cibul.net': 'Gaetan Latouche' },
    subject: 'Messagerie OpenAgenda: You have a new message',
    body: '<p>fdqfdsqfdsq</p>\n<p>Kari Olafsson:</p>\n<p>"fdqfdsqfdq"</p>\n<p><a href="http://d.openagenda.com/frontend_dev.php/messages/1539851231500506" target="_blank">voir le message sur OpenAgenda / répondre</a></p>',
    type: 'html'
  }

*/
function mail( req, res, next ) {

  let data = req.body,

    mail = {};

  if ( !data ) {

    req.log( 'error', 'no body found' );

    return _done( req, res );

  }

  if ( !data.recipient ) {

    req.log( 'error', 'no recipient' );

    return _done( req, res );

  }

  if ( !data.body ) {

    req.log( 'error', 'no body' );

    return _done( req, res );

  }

  mail[ data.type !== 'text' ? 'html' : 'text' ] = data.body;

  mail.recipient = _cleanRecipients( data.recipient );

  if ( !mail.recipient.length ) {

    req.log( 'error', 'no recipients for mail with data: %s', data.body.substr( 0, 200 ) + '...' );

    return _done( req, res );

  }

  mail.subject = data.subject;

  if ( data.unsubscribe ) {

    // unsubscribed.getLinks( data.unsubscribe )

  }

  // mailer( mail, err => {

  _done( req, res );

  // } );

}

function _done( req, res ) {

  cmn.renderJson( req, res, { success: true } );

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

    return next( 'Not allowed.' );

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
