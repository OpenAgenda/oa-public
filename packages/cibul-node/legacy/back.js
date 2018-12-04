"use strict";

const config = require( '../config' );

const _ = require( 'lodash' );
const async = require( 'async' );
const bodyParser = require( 'body-parser' );
const cmn = require( '../lib/commons-app' );
const qs = require( 'qs' );
const VError = require( 'verror' );

const activitiesSvc = require( '@openagenda/activities' );
const agendas = require( '@openagenda/agendas' );
const agendaEventsSvc = require( '../services/agendaEvents' );
const sessions = require( '@openagenda/sessions' );
const referencesSvc = require( '@openagenda/agenda-event-references' );
const sCache = require( '@openagenda/simple-cache' );
const utils = require( '@openagenda/utils' );

const agendaSvc = require( '../services/agenda' );
const legacyEventSvc = require( '../services/event' );
const formOrderMw = require( './formOrder.mw.js' );
const formFieldsByUser = require( './formFieldsByUser.mw.js' );
const modLib = require( '../lib/moduleLib' );
const notificationMail = require( '../services/notification/mail' );
const legacyEvents = require( '../services/events' ).legacy;

const agendaLocations = require( '@openagenda/agenda-locations' );

const logRequests = require( '../services/logRequests' );

const logger = require( '@openagenda/logs' );

const apiLog = logger( 'legacyApi' );
const log = logger( 'legacy' );

const routes = {

    /**
     * provide to sf the html of the head section of an agenda
     */
    headPart: [ 'get', '/:slug/head', [
      agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
      head
    ] ],


    eventCreate: [ 'get', '/events/:eventUid/create', [
      _loadOptionalAgenda,
      _loadEventByUid,
      eventCreate
    ] ],

    eventUpdate: [ 'get', '/events/:eventUid/update', [
      _loadEventByUid,
      eventUpdate
    ] ],

    legacyApi: [ 'get', '/api', [
      api
    ] ],

    legacyApiLocationSync: [ 'get', '/api/agendas/:agendaUid/locations/:locationUid/sync', [
      locationSync
    ] ],

    legacyApiGetCached: [ 'get', '/api/cache', [ apiGetCached ] ],

    legacyApiPostCached: [ 'post', '/api/cache', [ bodyParser.json(), apiPostCached ] ],

    legacyApiSystem: [ 'post', '/api/system', [ bodyParser.json(), apiSystem ] ],

    /**
     * process a save for event references
     */
    eventReferencesSave: [ 'post', '/:slug/events/:eventUid/references', [
      agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
      _loadEventByUid,
      bodyParser.json(),
      referencesSave
    ] ],


    /**
     * process an event delete
     */
    eventDelete: [ 'get', '/events/:eventUid/delete', [
      _loadEventByUid,
      eventDelete
    ] ],

    legacyAgendaCredentials: [ 'get', '/:slug/credentials', [
      ( req, res, next ) => {

        agendas.get( { slug: req.params.slug }, { private: null, internal: true }, ( err, agenda ) => {

          if ( err ) return next( err );

          res.json( agenda.credentials );

        } );

      }
    ] ],

    /**
     * log sf messages
     */
    log: [ 'post', '/log', [
      bodyParser.json(),
      logController
    ] ],

    formOrder: [ 'get', '/:slug/form-order', [
      agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
      formOrderMw
    ] ],

    legacyFormFieldsByUser: [ 'get', '/:slug/form-fields/:userUid', [
      agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
      formFieldsByUser
    ] ],


    /**
     * send mails on behalf of sf
     */
    mail: [ 'post', '/mail', [
      bodyParser.json(),
      mail
    ] ],

    notifications: [ 'post', '/notifications', [
      bodyParser.json(),
      ( req, res, next ) => {

        cmn.renderJson( req, res, { success: true } );

        notificationMail( req.body, ( err, mails ) => {

          if ( err ) return next( err );

          // mails.forEach( mailer );

        } );

      }
    ] ],

    verifyContributorIP: [ 'post', '/contributor/ip', [
      bodyParser.json(),
      ( req, res, next ) => {

        agendas.get( { uid: req.body.agendaUid }, { private: null }, ( err, agenda ) => {

          if ( err ) return next( err );

          if ( !agenda ) return next( new Error( 'Agenda not found: ' + req.body.agendaUid ) );

          const authorizedIPs = agenda.settings.contribution.authorizedIPAddresses;

          if ( !authorizedIPs || !authorizedIPs.length || ( req.body.ip === '127.0.0.1' && process.env.NODE_ENV === 'development' ) ) {

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
    ] ],

    /**
     * provide session data to sf
     */
    session: [ 'get', '/session', session ]

  };

module.exports = function ( path ) {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'legacy' ),
    _checkLocalhost
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


/**
 * give a rendered header of agenda
 */

function head( req, res, next ) {

  agendas.get( { uid: req.agenda.uid }, { private: null }, ( err, agenda ) => {

    cmn.render( req, res, 'agenda/headPart', {
      mailto: cmn.agendaMailTo( agenda ),
      agenda: req.agenda,
      includeActionLinks: true,
      targetBlank: true
    } );

  } );

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

  const cleanUri = _cleanApiUri( req ), ttl = 60*60;

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

      agendaSvc.get( { uid: a.uid }, ( err, agenda ) => {

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

  legacyEvents.onUpdate( req.event, { userUid: req.query.userUid || null, agendaUid: req.query.agendaUid || null } );

}


function eventCreate( req, res, next ) {

  req.log( 'event was created' );

  res.send( 'ok' );

  legacyEvents.onCreate( req.event, { userUid: req.query.userUid || null, agendaUid: req.query.agendaUid || null } );

  if ( !req.agenda ) return;

  req.event.loadAgendaCustomContext( {
    uid: req.agenda.uid,
    customFields: req.agenda.getCustomFieldsConfig()
  } );

  req.event.evaluateCustomImageDuplication( err => {

    if ( err ) req.log( 'error', err );

    activitiesSvc.feed( { entityType: 'event', entityUid: req.event.uid } ).create( ( err, eventFeed ) => {

      if ( err ) {

        return next( new VError( err, 'could not create feed for event of uid %s', req.event.uid ) );

      }

    } );

  } );

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

  agendaSvc.get( { uid: req.query.agendaUid }, { instanciate: true }, ( err, agenda ) => {

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
