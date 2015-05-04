"use strict";

var modLib = require( '../lib/moduleLib' ),

agendaSvc = require( '../services/agenda/agenda' ),

cmn = require( '../lib/commons-app' ),

utils = require( '../lib/utils' ),

eventSvc = require( '../services/event/event' ),

perPage = 20,

async = require( 'async' ),

i18n = require( '../i18n/i18n' ),

timeHelper = require( 'cibulTemplates' ).helpers.time,

log = require( '../lib/logger' )( 'agenda api front' ),

routes = {

  agendaApiEvents: [ 'get', '', [
    _loadFormat( 'format' ),
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.search( perPage ),
    _apiAgendaEventsClean,
    events
  ] ]

};

module.exports = function( path ) {

  return {
    load: modLib.Router( routes ).load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function events( req, res ) {

  cmn.renderJson( req, res, {
    events: req.formatted,
    total: req.total
  } );

}

function _apiAgendaEventsClean( req, res, next ) {

  _apiEventsClean( req, res, function() {

    var ids = [];

    req.events.forEach( function( e, i ) {

      req.formatted[ i ].canonicalUrl = req.genUrl( 'agendaEventShow', { 
        slug: req.agenda.slug,
        eventSlug: e.slug
      }, { protocol: 'https://' } );

      ids.push( e.id );

    });

    eventSvc.list( { ids: ids }, function( err, events ) {

      var custom = {}, i = 0;

      if ( err ) return next( err );

      async.eachSeries( events, function( event, ecb ) {

        req.agenda.getEventPublicCustomFields( event, function( err, values ) {

          if ( err ) return ecb( err );

          req.formatted[ i ].custom = values;

          i++;

          ecb();

        })

      }, next );

    });

  });

}

function _apiEventsClean( req, res, next ) {

  var clean = [],

  _t = {
    fr: timeHelper( { lang: 'fr' } ),
    en: timeHelper( { lang: 'en' } ),
  },

  locationFieldsMap = {
    conditions: 'pricingInfo',
    registrationUrl: 'ticketLink',
    locationName: 'name',
    locationUid: 'uid',
    address: 'address',
    postalCode: 'postcode',
    city: 'city',
    district: 'district',
    department: 'department',
    region: 'region',
    latitude: 'latitude',
    longitude: 'longitude',
    timings: 'timings'
  };

  req.events.forEach( function( e ) {

    var eInst = eventSvc.instanciate( e ),

    dateRange = eInst.getDateRange( true ),

    c = {
      uid: e.uid,
      canonicalUrl: req.genUrl( 'eventShow', { eventSlug: e.slug }, { protocol: 'https://' } ),
      title: e.title,
      description: e.description,
      longDescription: e.freeText,
      image: eInst.getImage(),
      thumbnail: eInst.getThumbnail(),
      originalImage: eInst.getFullImage(),
      updatedAt: e.updatedAt,
      range: {
        fr: i18n( dateRange[ 0 ], _t.fr( dateRange[1] ), 'fr' ).replace( ':', 'h' ),
        en: i18n( dateRange[ 0 ], _t.en( dateRange[1] ), 'en' )
      }
    },

    l = e.locations.length ? e.locations[ 0 ] : false;

    if ( l ) {

      for( var f in locationFieldsMap ) {

        c[ f ] = null;

        if ( l[ locationFieldsMap[ f ] ] ) {
          
          c[ f ] = l[ locationFieldsMap[ f ] ];

        }

      }

    }

    clean.push( c );

  } );

  req.formatted = clean;

  next();

}

function _loadFormat( paramName ) {

  return function( req, res, next ) {

    if ( [ 'json' ].indexOf( req.params[ paramName ] ) == -1 ) {

      return next( 'unkown format' );

    }

    req.requiredFormat = req.params[ paramName ];

    next();

  }

} 