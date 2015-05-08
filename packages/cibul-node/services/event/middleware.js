"use strict";

var svc,

p = require( '../../lib/promises' ), w = p.w;

module.exports = function( eventService ) {

  svc = eventService;

  return {
    load: loadEvent,
    cleanEvents: cleanEvents,
    search: search
  }

}


/**
 * load event instance and set it in req.event
 */

function loadEvent( paramName, fieldName ) {

  return function( req, res, next ) {

    w( { req: req, res: res, event: false } )

    .then( _get( paramName, fieldName ) )

    .then( p.ifl( { event: true }, _selectLanguage ) )

    .then( _loadAccessRequired )

    .then( p.ife( { 'req.agenda': true, accessRequired: true }, _loadUserAgendaCreds ) )

    .then( p.ifl( { accessRequired: true, hasCreds: false }, _loadOwnershipCreds ) )

    .then( p.ifl( { accessRequired: true, hasCreds: false, 'event.isDraft': false }, _redirectToCanonical ) )

    .done( function( v ) {

      if ( !v.event ) return next( { code: 404 } );

      if ( v.redirect ) return res.redirect( v.redirect.code, v.redirect.to );

      if ( v.accessRequired && !v.hasCreds ) return next( { code: 401 } );

      req.event = v.event;

      next();

    });

  }

}


function search( limit ) {

  return function( req, res, next ) {

    es.search( req.query.search, {
      limit: limit,
      page: req.query.page
    }, function( err, data ) {

      if ( err ) return next( err );

      req.events = data.events;

      req.total = data.total;

      next();

    });

  }

}


function cleanEvents( req, res, next ) {

  var clean = svc.exports.cleanEvents( req.events, {
    genUrl: req.genUrl
  });
  
  req.formatted = clean;

  next();

}


function _redirectToCanonical( v ) {

  v.redirect = {
    code: 301,
    to: v.req.genUrl( 'eventShow', { eventSlug: v.event.slug } )
  };

  return v;

}


function _selectLanguage( v ) {

  if ( !v.req.query.elang ) return v;

  if ( !v.event.hasLanguage( v.req.query.elang ) ) {

    v.redirect = {
      code: 301,
      to: v.req.genUrl( v.req.agenda ? 'agendaEventShow' : 'eventShow', req.agenda ? { slug: req.agenda.slug, eventSlug: v.event.slug } : { eventSlug: v.event.slug } )
    };

  } else {

    v.event.switchLanguage( v.req.query.elang );

  }

  return v;

}


function _loadOwnershipCreds( v ) {

  if ( !v.req.session.logged ) return rs( v );

  if ( v.event.ownerId == v.req.session.userId ) {

    v.hasCreds = true;

  }

  return v;

}


function _loadUserAgendaCreds( v ) {

  if ( !v.req.session.logged ) return rs( v );

  return w.promise( function( rs, rj ) {

    v.req.agenda.isAdministrator( { id: v.req.session.userId }, function( err, isAdmin ) {

      if ( err ) return rj( err );

      if ( isAdmin ) return rs( _setHasCreds( v ) );

      v.req.agenda.isModerator( { id: v.req.session.userId }, function( err, isModerator ) {

        if ( err ) return rj( err );

        if ( isModerator ) _setHasCreds( v );

        rs( v );

      });

    } );

  });

}

function _setHasCreds( v ) {

  v.hasCreds = true;

  return v;

}


/**
 * check whether event access is restricted
 */

function _loadAccessRequired( v ) {

  v.accessRequired = ( v.req.agenda && !v.event.isPublishedOn( v.req.agenda ) ) || v.event.isDraft;

  return v;

}


/**
 * load event instance from request parameters
 */

function _get( paramName, fieldName ) {

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  return function( v ) {

    return w.promise( function( rs, rj ) {

      var getParams = {};

      getParams[ fieldName ] = v.req.params[ paramName ];

      if ( v.req.agenda ) getParams.reviewId = v.req.agenda.id;

      svc.get( getParams, function( err, e ) {

        if ( err ) return rj( err );

        if ( !e ) return rj( { code: 404 } );

        v.event = e;

        rs( v );

      } );

    });

  }

}