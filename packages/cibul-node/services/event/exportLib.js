"use strict";

var svc, middlewares,

utils = require( '../../lib/utils' ),

i18n = require( '../../i18n/i18n' ),

timeHelper = require( 'cibulTemplates' ).helpers.time;

module.exports = function( service ) {

  svc = service;

  return {
    cleanEvents: cleanEvents
  }

}


function cleanEvents( events, options ) {

  var clean = [],

  params = utils.extend( {
    genUrl: function() {}
  }, options ),

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

  events.forEach( function( e, i ) {

    var eInst = events[ i ] = svc.instanciate( e ),

    dateRange = eInst.getDateRange( true ),

    c = {
      uid: e.uid,
      slug: e.slug,
      canonicalUrl: params.genUrl( 'eventShow', { eventSlug: e.slug }, { protocol: 'https://' } ),
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

  return clean;

}