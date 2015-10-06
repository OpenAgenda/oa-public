"use strict";

var modLib = require( '../lib/moduleLib' ),

agendaSvc = require( '../services/agenda' ),

eventSvc = require( '../services/event' ),

userSvc = require( '../services/user' ),

cmn = require( '../lib/commons-app' ),

log = require( 'logger' )( 'legacy' ),

utils = require( 'utils' ),

routes = {

  headPart: [ 'get', '/:slug/head', [
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
    head
  ] ],

  customImageSave: [ 'get', '/:slug/events/:eventUid/custom/:field/user/:userUid', [
    agendaSvc.mw.load( 'slug', { basicLoad: true, cache: true } ),
    customImageSave
  ] ],

  log: [ 'post', '/log', logController ]

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

function logController( req, res, next ) {

  var body = {};

  if ( typeof req.body == 'object' ) {

    for( var v in req.body ) {

      try {

        utils.extend( body, JSON.parse( v ) );

      } catch( e ) {

        // who gives a nucklefuck.

      }

    }

  }

  if ( utils.size( body ) ) {

    log( body );

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