"use strict";

var modLib = require( '../lib/moduleLib' ),

agendaSvc = require( '../services/agenda' ),

eventSvc = require( '../services/event' ),

userSvc = require( '../services/user' ),

cmn = require( '../lib/commons-app' ),

log = require( 'logger' )( 'legacy' ),

utils = require( 'utils' ),

bodyParser = require( 'body-parser' ),

mailer = require( 'mailer' ),

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
    customImageSave
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
  ] ]

};

module.exports = function( path ) {

  var router = modLib.Router( routes );

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

  var data = {
    agenda: req.agenda
  }

  data.agenda.theme = req.agenda.getTheme();

  cmn.render( req, res, 'agenda/headPart', data );

}


function customImageSave( req, res, next ) {

  req.log( 'received request to save custom image' );

  eventSvc.get( { uid: req.params.eventUid }, function( err, event ) {

    if ( err || !event ) {

      req.log( 'error', err || 'no event found for ' + req.params.eventUid );

      return next( err || 'no event found' );

    }

    userSvc.get( { uid: req.params.userUid }, function( err, user ) {

      if ( err || !user ) {

        req.log( 'error', err || 'no user found for ' + req.params.userUid );

        return next( err || 'no user found' );

      }

      event.loadAgendaCustomContext( {
        uid: req.agenda.uid,
        customFields: req.agenda.getCustomFieldsConfig()
      });

      event.saveCustomImage( {
        name: req.params.field,
        userUid: user.uid
      }, ( err, destUrl ) => {

        req.log( destUrl );

        res.send( destUrl );

      } );

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

      log( utils.extend( {
        origin: 'symfony',
      }, req.body ) );

    } catch( e ) {

      log( 'error', { origin: 'sf log', body: JSON.stringify( req.body ) } )

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

    });

  } else if ( typeof recipients == 'object' ) {

    clean = _extractRecipients( recipients );

  }

  return clean;

}

function _extractRecipients( obj ) {

  let emails = [];

  for( let email in obj ) emails.push( email );

  return emails;

}