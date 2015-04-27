"use strict";

var svc,

es = require( '../es/es' );

module.exports = function( agendaService ) {

  svc = agendaService;

  return {
    load: loadAgenda,
    search: searchEvents,
    browserCache: browserCache
  }

}



/**
 * load agenda instance and set it in req.agenda
 */

function loadAgenda( paramName, fieldName, basicLoad ) {

  if ( typeof fieldName == 'undefined' ) {

    fieldName = paramName;

  }

  return function( req, res, next ) {

    var getParams = {};

    getParams[ fieldName ] = req.params[ paramName ];

    svc.get( getParams, function( err, a ) {

      if ( err ) {

        if ( err == 'agenda not found' ) {

          return next( { code: 404 } );

        } else {

          return next( 'agenda service error' );

        }

      }

      req.agenda = a;

      if ( basicLoad ) return next();

      // if full load ( default )
      // is requested, more info is fetched

      _loadIsPassed( req.agenda, function( err ) {

        if ( err ) return next( err );

        req.agenda.hasPublishedEvents( function( err, has ) {

          if ( err ) return next( err );

          req.agenda.isEmpty = !has;

          next();

        });

      } );

    } );

  }

}

function formatTemplateData( req, res, next ) {

  req.template = 'agenda/show';

  req.templateData = {
    uid: req.agenda.uid,
    slug: req.agenda.slug,
    title: req.agenda.title,
    description: req.agenda.description,
    url: req.agenda.url,
    image: req.agenda.getImage( false ),
    passed: req.agenda.passed,
    uri: 'agendaShow'
  };

  req.templateData.importUri = req.genUrl( 'agendaActionShow', { slug: req.agenda.slug } );

  req.templateData.hasSearchQuery = !!lib.size( req.query.search );

  next();

}


function searchEvents( limit ) {

  return function( req, res, next ) {

    es.agendas( req.agenda ).search( req.query.search, { limit: limit, page: req.query.page }, function( err, data ) {

      if ( err ) return next( err );

      req.events = data.events;

      req.total = data.total;

      next();

    });

  }

}


function browserCache( req, res, next ) {

  var lastUpdate = req.agenda.updatedAt;

  if ( _hasQueryOtherThan( req, 'callback' ) ) {

    return next();

  }

  if ( req.headers[ 'if-modified-since' ] === lastUpdate.toString() ) {

    res.status( 304 ).end();

    return;

  }

  res.set( 'Last-Modified', req.agenda.updatedAt );

  next();

}


function _loadIsPassed( agenda, cb ) {

  var now = new Date();

  agenda.getLastOccurrence( function( err, lastOccurrence ) {

    if ( err ) return cb( err );

    agenda.passed = lastOccurrence ? ( now > new Date( lastOccurrence.end ) ) : false;

    cb();

  });

}


function _hasQueryOtherThan( req, exceptions ) {

  if ( typeof exceptions == 'string' ) exceptions = [ exceptions ];

  if ( !exceptions ) exceptions = [];

  for( var q in req.query ) {

    if ( exceptions.indexOf( q ) == -1 ) return true;

  }

  return false;

}