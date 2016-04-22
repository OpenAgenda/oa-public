"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

eventSvc = require( '../services/event' ),

agendaSvc = require( '../services/agenda' ),

STATETYPES = require( '../services/model' ).events().STATETYPES,

contributorLabels = require( 'labels/event/contributors' ),

w = require( 'when' ),

routes = {

  eventChangeState: [ 'get', '/events/:eventSlug/state/:type', [
    agendaSvc.mw.load( 'slug' ), 
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.checkEventEditor,
    _checkAuthorizedChanges( [ STATETYPES.PUBLISHED ] ),
    _changeState,
    _redirect
  ] ],

  agendaEventChangeState: [ 'get', '/:slug/events/:eventSlug/state/:type', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _checkAuthorizedChanges( [ STATETYPES.VALIDATED, STATETYPES.NOTVALIDATED, STATETYPES.PUBLISHED ] ),
    _changeStateCredential,
    _changeState,
    _xhrResponse,
    _redirect
  ] ],

  agendaEventChangeFeatured: [ 'get', '/:slug/events/:eventSlug/featured/:type', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    cmn.checkAdminOrModerator,
    _checkAuthorizedChanges( [ 'featured', 'notfeatured' ] ),
    _changeFeatured,
    _redirect
  ] ],

  agendaEventPrivate: [ 'get', '/agendas/:uid/events/:eventUid/private', [
    agendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    cmn.checkAdminOrModerator,
    getPrivateEventData
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


function getPrivateEventData( req, res, next ) {

  w( {
    req: req,
    res: res,
    custom: false,
    labels: false,
    contributor: false
  } )

  // get private custom data
  .then( v => {

    let d = w.defer();

    req.agenda.getEventPrivateCustomData( req.event, ( err, custom ) => {

      if ( err ) return d.reject( err );

      v.custom = custom;

      v.labels = v.req.agenda.getCustomFieldsLabels( v.req.event.getCurrentLanguage() );

      d.resolve( v );

    });

    return d.promise;

  } )

  // get contributor info
  .then( v => {

    let d = w.defer();

    req.event.getContributorInfo( ( err, contributorInfo ) => {

      if ( err ) return d.reject( err );

      if ( contributorInfo && contributorInfo.organizationSlug ) {

        contributorInfo.organizationSlug = undefined;

      }

      v.contributor = contributorInfo || {};

      d.resolve( v );

    } );

    return d.promise;

  } )

  .done( v => {

    cmn.renderJson( req, res, {
      custom: {
        custom: v.custom,
        labels: v.labels  
      },
      contributor: {
        data: v.contributor,
        labels: {
          organization: contributorLabels.organization[ req.lang ],
          contactNumber: contributorLabels.contactNumber[ req.lang ],
          contactName: contributorLabels.contactName[ req.lang ],
          contactPosition: contributorLabels.contactPosition[ req.lang ]
        }
      }
    } );

  }, next );

}


function _xhrResponse( req, res, next ) {

  if ( req.xhr ) {

    cmn.renderJson( req, res, { success: true } );

  } else {

    next();

  }

}

function _redirect( req, res ) {

  var uri = 'eventShow',

  query = { eventSlug: req.event.slug },

  redirectUrl;

  if ( req.query.redirect ) {

    redirectUrl = req.query.redirect;

  } else if ( req.agenda ) {

    query.slug = req.agenda.slug;

    redirectUrl = req.genUrl( 'agendaEventShow', query );

  } else {

    redirectUrl = req.genUrl( 'eventShow', query );      

  }

  req.log( 'redirecting to %s', redirectUrl );

  res.redirect( redirectUrl );

}


function _changeStateCredential( req, res, next ) {

  let settings = req.agenda.getSettings( true );

  if ( parseInt( req.params.type ) === STATETYPES.PUBLISHED && !settings.moderators.canPublish ) {

    cmn.checkAdministrator( {
      message: 'Only agenda administrators may publish events',
      redirect: req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } )
    } )( req, res, next );

  } else {

    cmn.checkAdminOrModerator( req, res, next );

  }

}


function _changeState( req, res, next ) {

  req.log( 'updating state to %s', req.params.type );

  req.event.setState( req.params.type, function( err ) {

    if ( err ) {

      return next( { code: 500 } );

    }

    if ( !req.xhr ) res.setFlash( req, 'The event state has changed', {} );

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

    req.log( 'checking authorized changes for type %s', req.params.type );

    var type = req.params.type;

    if ( type == parseInt( type, 10 ) ) {

      type = parseInt( type, 10 );

    }

    if ( authorizedTypes.indexOf( type ) == -1 ) {

      req.log( 'type is not authorized: %s', req.params.type );

      return next( { code: 403 } );

    }

    req.log( 'type is authorized: %s', req.params.type );

    next();

  }

}