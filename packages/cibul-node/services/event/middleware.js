"use strict";

var svc,

w = require( 'when' );

module.exports = function( eventService ) {

  svc = eventService

  return {
    load: loadEvent(),
    loadAgendaEvent: loadEvent( true ),
    cleanEvents: cleanEvents,
    search: search
  }

}


/**
 * load event instance and set it in req.event
 */

function loadEvent( fromAgenda ) {

  return function( paramName, fieldName ) {

    if ( typeof fieldName == 'undefined' ) {

      fieldName = paramName;

    }

    return function( req, res, next ) {

      w( {
        paramName: paramName,
        fieldName: fieldName,
        req: req,
        res: res,
        fromAgenda: fromAgenda,
        event: false,
        isPublished: false
      } )

      .then( _get )

      .then( _loadPublishedState )

      .then( _checkUserAccess )

      .then( _selectLanguage )

      .done( function( v ) {

        if ( v.redirect ) {

          res.redirect( v.redirect.code, v.redirect.to );

          return;

        }

        req.event = v.event;

        next();

      }, next );

    }

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




/**
 * if event is not published, check that user
 * has access ( either admin or moderator )
 */

function _checkUserAccess( v ) {

  if ( v.isPublished ) return v;

  return w.promise( function( rs, rj ) {

    if ( !v.req.session.logged ) return rj( { code: 401 } );

    v.req.agenda.isAdministrator( { id: v.req.session.userId }, function( err, isAdmin ) {

      if ( err ) return rj( err );

      if ( !isAdmin ) v.req.agenda.isModerator( { id: v.req.session.userId }, function( err, isModerator ) {

        if ( err ) return rj( err );

        if ( !isModerator ) {

          return rj( { code: 403 } );

        }

        rs( v );

      } );

    } );

  });

}



/**
 * load event published state
 */

function _loadPublishedState( v ) {

  v.isPublished = false;

  if ( !v.fromAgenda || v.event.isPublishedOn( v.req.agenda ) ) {

    v.isPublished = true;

  }

  return v;

}


/**
 * load event instance from request parameters
 */

function _get( v ) {

  return w.promise( function( rs, rj ) {

    var getParams = {};

    getParams[ v.fieldName ] = v.req.params[ v.paramName ];

    if ( v.fromAgenda ) {

      getParams.reviewId = v.req.agenda.id;

    }

    svc.get( getParams, function( err, e ) {

      if ( err ) return rj( err );

      if ( !e ) return rj( { code: 404 } );

      v.event = e;

      rs( v );

    } );

  });

}