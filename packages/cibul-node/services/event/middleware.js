"use strict";

var svc,

p = require( '../../lib/promises' ), w = p.w,

log = require( '../../lib/logger' )( 'event middleware' );

module.exports = function( eventService ) {

  svc = eventService;

  return {
    load: loadEvent,
    cleanEvents: cleanEvents,
    search: search,
    checkEventEditor: checkEventEditor
  }

}


/**
 * load event instance and set it in req.event
 */

function loadEvent( paramName, fieldName ) {

  return function( req, res, next ) {

    w( { req: req, res: res, event: false } )

    .then( _get( paramName, fieldName ) )

    .then( _selectLanguage )

    .then( _loadAccessRequired )

    .then( p.ifl( { 'req.agenda' : true }, _loadAgendaContext ) )

    .then( p.ifl( { 'req.agenda' : true, accessRequired: true }, _loadUserAgendaCreds ) )

    .then( p.ifl( { accessRequired: true }, _loadUserCreds ) )

    .then( p.ifl( { 'req.agenda' : true, accessRequired: true, hasAgendaCreds: false }, _redirectToCanonicalIfNotDraft ) )

    .done( function( v ) {

      if ( v.redirect ) return res.redirect( v.redirect.code, v.redirect.to );

      req.event = v.event;

      if ( v.accessRequired ) {

        if ( !req.session.logged ) return next( { code: 401 } );

        if ( req.agenda && !v.hasAgendaCreds ) return next( { code: 403 } );

        if ( !v.hasCreds ) return next( { code: 403 } );

      }

      next();

    }, next );

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

  req.formatted = svc.exports.cleanEvents( req.events );

  next();

}


function checkEventEditor( req, res, next ) {

  req.event.isEditor( req.session.userId, function( err, is ) {

    if ( err || !is ) return next( err || { code: 403 } );

    next();

  } );

}


function _loadAgendaContext( v ) {

  return w.promise( function( rs, rj ) {

    v.event.loadAgendaContext( v.req.agenda.id, function( err ) {

      if ( err ) return rj( err );

      rs( v );

    });

  });

}


function _redirectToCanonicalIfNotDraft( v ) {

  if ( !v.event.getIsDraft() ) {

    v.redirect = {
      code: 302,
      to: v.req.genUrl( 'eventShow', { eventSlug: v.event.slug } )
    };

  }

  return v;

}


function _selectLanguage( v ) {

  if ( !v.req.query.elang ) return v;

  if ( !v.event.hasLanguage( v.req.query.elang ) ) {

    v.redirect = {
      code: 302,
      to: v.req.genUrl( v.req.agenda ? 'agendaEventShow' : 'eventShow', v.req.agenda ? { slug: v.req.agenda.slug, eventSlug: v.event.slug } : { eventSlug: v.event.slug } )
    };

  } else {

    v.event.switchLanguage( v.req.query.elang );

  }

  return v;

}


function _loadOwnershipCreds( v ) {

  if ( !v.req.session.logged ) return v;

  if ( v.event.ownerId == v.req.session.userId ) {

    log( 'user is owner' );

    v.hasCreds = true;

  }

  return v;

}


function _loadUserAgendaCreds( v ) {

  v.req.log( 'loading user agenda creds' );

  if ( !v.req.session.logged ) {

    v.req.log( 'user is not logged' );

    return v;

  }

  var user = { id: v.req.session.userId };

  return w.promise( function( rs, rj ) {

    v.req.agenda.isAdministrator( user , function( err, is ) {

      v.req.log( 'user %s administrator', is ? 'is' : 'is not' );

      if ( err ) return rj( err );

      if ( is ) {

        v.hasAgendaCreds = true;

        return rs( v );

      };

      v.req.agenda.isModerator( user, function( err, is ) {

        if ( err ) return rj( err );

        if ( is ) v.hasAgendaCreds = true;

        return rs( v );

      });

    } )

  });

}


function _loadUserCreds( v ) {

  v.req.log( 'checking user creds' );

  if ( !v.req.session.logged ) {

    v.req.log( 'user is not logged' );

    return v;

  }

  return w.promise( function( rs, rj ) {

    // I just need to be able to see it if it is not draft.
    // if it is draft

    v.event.isEditor( v.req.session.userId, function( err, is ) {

      v.req.log( 'user is editor' );

      if ( err ) return rj( err );

      if ( is ) v.hasCreds = true;

      rs( v );

    });

  });

}


/**
 * check whether event access is restricted
 */

function _loadAccessRequired( v ) {

  v.isDraft = v.event.getIsDraft();

  v.accessRequired = ( v.req.agenda && !v.event.isPublishedOn( v.req.agenda ) ) || v.isDraft;

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

      v.req.log( 'getting event with params %s', JSON.stringify( getParams ) );

      svc.get( getParams, function( err, e ) {

        if ( err ) return rj( err );

        if ( !e ) {

          v.req.log( 'did not find event' );

          return rj( { code: 404 } );

        }

        v.event = e;

        rs( v );

      } );

    });

  }

}