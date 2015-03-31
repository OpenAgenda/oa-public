"use strict";

var svc;

module.exports = function( agendaService ) {

  svc = agendaService;

  return {
    load: loadAgenda,
    format: formatTemplateData,
    loadEvents: loadEvents
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

      if ( err ) return next( 'agenda service error' );

      req.agenda = a;

      if ( basicLoad ) return next();

      // if full load ( default )
      // is requested, more info is fetched

      _loadIsPassed( req.agenda, function( err ) {

        if ( err ) return next( err );

        req.agenda.hasPublishedEvents( function( err, has ) {

          if ( err ) return next( err );

          req.agenda.hasPublishedEvents = has;

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


function loadEvents( req, res, next ) {

  var isEmpty = false;

  req.esQuery.reviewId = req.agenda.id;

  req.esQuery.order = [ 'upcoming' ];

  wn.call( req.agenda.hasPublishedEvents )

  .then( function( hasPublishedEvents ) {

    if ( !hasPublishedEvents ) {

      isEmpty = true;

      return { data: [], total: 0 };

    } else {

      return wn.call( es.events().search, req.esQuery )

    }

  })

  .then( mw.search.prepareEvents )

  .spread( function( events, total ) {

    req.templateData = deepExtend( req.templateData, {
      isEmpty: isEmpty,
      events: events,
      total: total,
      scriptParams: {
        total: total,
        empty: isEmpty
      }
    }, _pager( req, total ) );

    next();

  } );

}


function _loadIsPassed( agenda, cb ) {

  var now = new Date();

  agenda.getLastOccurrence( function( err, lastOccurrence ) {

    if ( err ) return cb( err );

    agenda.passed = now > new Date( lastOccurrence.end );

    cb();

  });

}