"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

log = require( '../lib/logger' )( 'event/back' ),

eventSvc = require( '../services/event' ),

agendaSvc = require( '../services/agenda/agenda' ),

TYPES = require( '../services/model' ).events().STATETYPES,

routes = {

  eventChangeState: [ 'get', '/events/:eventSlug/state/:type', [
    cmn.loadAgenda( 'slug' ), 
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.checkEventEditor,
    _checkAuthorizedChanges( [ TYPES.PUBLISHED ] ),
    _changeState,
    _redirect
  ] ],

  agendaEventChangeState: [ 'get', '/:slug/events/:eventSlug/state/:type', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    cmn.checkAdministrator,
    _checkAuthorizedChanges( [ TYPES.VALIDATED, TYPES.NOTVALIDATED, TYPES.PUBLISHED ] ),
    _changeState,
    _redirect
  ] ]

};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function _redirect( req, res ) {

  var uri = 'eventShow',

  query = { eventSlug: req.event.slug },

  redirectUrl;

  if ( req.agenda ) {

    uri = 'agendaEventShow';

    query.slug = req.agenda.slug;

  }

  redirectUrl = req.genUrl( uri, query );

  req.log( 'redirecting to %s', redirectUrl );

  res.redirect( redirectUrl );

}


function _changeState( req, res, next ) {

  req.log( 'updating state to %s', req.params.type );

  req.event.setState( req.params.type, function( err ) {

    if ( err ) {

      return next( { code: 500 } );

    }

    res.setFlash( req, 'The event state has changed', {} );

    next();

  } );

}


function _checkAuthorizedChanges( authorizedTypes ) {

  return function( req, res, next ) {

    if ( authorizedTypes.indexOf( parseInt( req.params.type, 10 ) ) == -1 ) {

      req.log( 'type is not authorized: %s', req.params.type );

      return next( { code: 403 } );

    }

    next();

  }

}