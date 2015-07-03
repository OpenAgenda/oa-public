"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

log = require( '../lib/logger' )( 'event/back' ),

eventSvc = require( '../services/event' ),

agendaSvc = require( '../services/agenda' ),

STATETYPES = require( '../services/model' ).events().STATETYPES,

routes = {

  eventChangeState: [ 'get', '/events/:eventSlug/state/:type', [
    cmn.loadAgenda( 'slug' ), 
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.checkEventEditor,
    _checkAuthorizedChanges( [ STATETYPES.PUBLISHED ] ),
    _changeState,
    _redirect
  ] ],

  agendaEventChangeState: [ 'get', '/:slug/events/:eventSlug/state/:type', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    cmn.checkAdministrator,
    _checkAuthorizedChanges( [ STATETYPES.VALIDATED, STATETYPES.NOTVALIDATED, STATETYPES.PUBLISHED ] ),
    _changeState,
    _redirect
  ] ],

  agendaEventChangeFeatured: [ 'get', '/:slug/events/:eventSlug/featured/:type', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    cmn.checkAdministrator,
    _checkAuthorizedChanges( [ 'featured', 'notfeatured' ] ),
    _changeFeatured,
    _redirect
  ] ],

  agendaEventPrivateCustomData: [ 'get', '/agendas/:uid/events/:eventUid/custom/private', [
    agendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    cmn.checkAdministrator,
    privateCustomData
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

function privateCustomData( req, res, next ) {

  req.agenda.getEventPrivateCustomData( req.event, function( err, custom ) {

    if ( err ) return next( err );

    var labels = req.agenda.getCustomFieldsLabels( req.event.getCurrentLanguage() );

    cmn.renderJson( req, res, {
      custom: custom,
      labels: labels
    });

  });

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


function _changeFeatured( req, res, next ) {

  var funcs = {
    'featured' : req.event.setFeatured,
    'notfeatured' : req.event.setUnfeatured
  };

  req.log( 'updating featured to %s', req.params.type );

  funcs[ req.params.type ]( true, function( err ) {

    if ( err ) {

      return next( { code: 500 } );

    }

    res.setFlash( req, req.params.type === 'featured' ? 'The event is now featured' : 'The event is no longer featured' );

    next();

  });

}


function _checkAuthorizedChanges( authorizedTypes ) {

  return function( req, res, next ) {

    var type = req.params.type;

    if ( type == parseInt( type, 10 ) ) {

      type = parseInt( type, 10 );

    }

    if ( authorizedTypes.indexOf( type ) == -1 ) {

      req.log( 'type is not authorized: %s', req.params.type );

      return next( { code: 403 } );

    }

    next();

  }

}