"use strict";

const sessions = require( 'sessions' ),

  qs = require( 'qs' ),

  _ = require( 'lodash' ),

  modLib = require( '../lib/moduleLib' ),

  agendaSvc = require( '../services/agenda' ),

  agendas = require( 'agendas' ),

  eventSvc = require( '../services/event' ),

  userSvc = require( '../services/user' ),

  sCache = require( 'simple-cache' ),

  VError = require( 'verror' ),

  aggregatorSvc = require( '../services/aggregator' ),

  async = require( 'async' ),

  referencesSvc = require( 'agenda-event-references' ),

  cmn = require( '../lib/commons-app' ),

  log = require( 'logger' )( 'legacy' ),

  utils = require( 'utils' ),

  bodyParser = require( 'body-parser' ),

  mailer = require( 'mailer' ),

  activitiesSvc = require( 'activities' ),

  agendaEvents = require( 'agenda-events' ),

  usersSvc = require( 'users' ),

  legacyEvents = require( '../services/events' ).legacy,

  stakeholdersSvc = require( 'agenda-stakeholders' ),

  notificationMail = require( '../services/notification/mail' ),

  routes = {

    /**
     * provide to sf the html of the head section of an agenda
     */
    headPart: [ 'get', '/:slug/head', [
      agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
      head
    ] ],


    /**
     * process a save for a custom image
     */
    customImageSave: [ 'get', '/:slug/events/:eventUid/custom/:field/user/:userUid', [
      agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
      _loadEventByUid,
      customImageSave
    ] ],


    eventCreate: [ 'get', '/events/:eventUid/create', [
      _loadOptionalAgenda,
      _loadEventByUid,
      eventCreate
    ] ],

    eventUpdate: [ 'get', '/events/:eventUid/update', [
      _loadEventByUid,
      eventUpdate
    ] ],

    legacyApi: [ 'get', '/api', [
      api
    ] ],

    legacyApiGetCached: [ 'get', '/api/cache', [ apiGetCached ] ],

    legacyApiPostCached: [ 'post', '/api/cache', [ bodyParser.json(), apiPostCached ] ],


    /**
     * process a save for event references
     */
    eventReferencesSave: [ 'get', '/:slug/events/:eventUid/references', [
      agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
      _loadEventByUid,
      referencesSave
    ] ],


    /**
     * process an event delete
     */
    eventDelete: [ 'get', '/events/:eventUid/delete', [
      _loadEventByUid,
      eventDelete
    ] ],

    /**
     * log sf messages
     */
    log: [ 'post', '/log', [
      bodyParser.json(),
      logController
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

          mails.forEach( mailer );

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

          if ( !authorizedIPs || !authorizedIPs.length ) {

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


let apiLog;

module.exports = function ( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'legacy' ),
    _checkLocalhost
  ] );

  apiLog = require( 'logger' )( 'legacyApi' );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


/**
 * give a rendered header of agenda
 */

function head( req, res, next ) {

  var data = {
    agenda: req.agenda
  }

  data.agenda.theme = req.agenda.getTheme();

  cmn.render( req, res, 'agenda/headPart', data );

}

function _loadEventByUid( req, res, next ) {

  eventSvc.get( { uid: req.params.eventUid }, ( err, event ) => {

    if ( err ) return next( err );

    if ( !event ) return next( 'no event found' );

    req.event = event;

    next();

  } );

}


function referencesSave( req, res, next ) {

  req.log( 'received request to save references for uids %s', req.query.uids );

  req.agenda.search( { uids: req.query.uids || [] }, { showAll: true }, ( err, result ) => {

    if ( err ) return next( err );

    req.log( 'events added as reference: %s', result.events.map( e => e.slug + ':' + e.id ).join( ',' ) );

    let refIds = result.events.map( e => parseInt( e.id.split( '@' )[ 0 ] ) );

    referencesSvc( req.agenda.id ).set( req.event.id, refIds, err => {

      req.log( 'references for event %s set: %s', req.event.id, refIds.join( ', ' ) );

      res.send( 'ok' );

    } );

  } );

}


function api( req, res ) {

  res.send( 'ok' );

  if ( req.query.uri ) {

    let parts = req.query.uri.split( '?' );

    let path = parts.shift();

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

  let cleanUri = _cleanApiUri( req );
  
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


function apiPostCached( req, res, next ) {

  let cleanUri = _cleanApiUri( req ), ttl = 60*60;

  if ( _isAgendaEventsApiUri( req.query.uri ) ) {

    sCache( 'agendas', _getAgendaUidFromAgendaEventsApiUri( cleanUri ) ).set( cleanUri, req.body.toCache, ttl, err => {

      req.log( 'storing cached response for uri %s as %s', req.query.uri, cleanUri );

      res.send( null );

    } );

  } else {

    sCache( 'legacyApi', '*' ).set( cleanUri, JSON.stringify( req.body.toCache ), ttl, err => {

      req.log( 'storing cached response for uri %s as %s', req.query.uri, cleanUri );

      return res.send( null );

    } );

  }


}

function _cleanApiUri( req ) {

  const parts = req.query.uri.split( '?' );

  let path = parts.shift();

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

  legacyEvents.onRemove( req.event, { userUid, agendaUid } );

  req.event.getAgendaReferences( ( err, agendas ) => {

    async.eachSeries( agendas, ( a, ecb ) => {

      agendaSvc.get( { uid: a.uid }, ( err, agenda ) => {

        agenda.removeEvent( req.event, ecb );

      } );

    }, err => {

      // allow some wiggle room for tasks to process
      setTimeout( () => {

        req.event.remove( err => {

          if ( err ) {

            log( 'error', 'event %s could not be removed: %s', req.event.id, err );

            console.log( err );

          } else {

            log( 'info', 'event %s removed', req.event.id );

          }

        } );

      }, 6000 );

      activitiesSvc.feed( { entityType: 'event', entityUid: req.event.uid } ).remove( () => {

        req.log( 'event %s feed removed', req.event.id );

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

      aggregatorSvc.isAggregator( req.agenda.id, ( err, isAggregator ) => {

        if ( err ) req.log( 'error', err );

        if ( isAggregator ) {

          return _addCreateEventActivity( eventFeed, req );

        }

        activitiesSvc.feed( { entityType: 'agenda', entityUid: req.agenda.uid } ).follow( eventFeed, err => {

          if ( err ) req.log( 'error', err );

          _addCreateEventActivity( eventFeed, req );

        } );

      } );

    } );

  } );

}


function customImageSave( req, res, next ) {

  req.log( 'received request to save custom image' );

  userSvc.get( { uid: req.params.userUid }, ( err, user ) => {

    if ( err || !user ) {

      req.log( 'error', err || 'no user found for ' + req.params.userUid );

      return next( err || 'no user found' );

    }

    req.event.loadAgendaCustomContext( {
      uid: req.agenda.uid,
      customFields: req.agenda.getCustomFieldsConfig()
    } );

    req.event.saveCustomImage( {
      name: req.params.field,
      userUid: user.uid
    }, ( err, destUrl ) => {

      req.log( destUrl );

      res.send( destUrl );

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

  mailer( mail, err => {

    _done( req, res );

  } );

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

function _addCreateEventActivity( eventFeed, req ) {

  usersSvc.get( req.event.ownerId, ( err, user ) => {

    if ( err ) return req.log( 'error', err );

    if ( !user ) {

      return req.log( 'error', new VError( 'user of id %s not found', req.event.ownerId ) );

    }

    activitiesSvc.feed( {
      entityType: 'user',
      entityUid: user.uid 
    } ).follow( eventFeed, err => {

      if ( err ) req.log( 'error', err );

      activitiesSvc.feed( { entityType: 'event', entityUid: req.event.uid } ).activities.add( {
        actor: 'user:' + user.uid,
        verb: 'event.create',
        object: 'event:' + req.event.uid,
        target: 'agenda:' + req.agenda.uid,
        store: {
          labels: {
            actor: user.full_name,
            object: req.event.title,
            target: req.agenda.title
          }
        }
      }, err => {

        if ( err ) req.log( 'error', err );

        stakeholdersSvc.agenda( req.agenda.id ).increment( { userId: user.id }, err => {

          if ( err ) req.log( 'error', err );

        } );

      } );

    } );

  } );

}