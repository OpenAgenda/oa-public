"use strict";

var svc,

utils = require( '../../lib/utils' ),

i18n = require( '../../i18n/i18n' ),

genUrl = require( '../genUrl' ),

timeHelper = require( 'cibulTemplates' ).helpers.time,

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

module.exports = function( service ) {

  svc = service;

  return {
    cleanEvents: cleanEvents,
    clean: cleanEvent
  }

}

function cleanEvent( eInst ) {

  var dateRange = eInst.getDateRange( true ),

  c = {
    uid: eInst.uid,
    slug: eInst.slug,
    canonicalUrl: genUrl( 'eventShow', { eventSlug: eInst.slug }, { protocol: 'https://' } ),
    title: eInst.title,
    description: eInst.description,
    longDescription: eInst.freeText,
    image: eInst.getImage(),
    thumbnail: eInst.getThumbnail(),
    originalImage: eInst.getFullImage(),
    updatedAt: eInst.updatedAt,
    range: {
      fr: i18n( dateRange[ 0 ], _t.fr( dateRange[ 1 ] ), 'fr' ).replace( ':', 'h' ),
      en: i18n( dateRange[ 0 ], _t.en( dateRange[ 1 ] ), 'en' )
    }
  },

  l = eInst.locations.length ? eInst.locations[ 0 ] : false;

  if ( l ) {

    for( var f in locationFieldsMap ) {

      c[ f ] = null;

      if ( l[ locationFieldsMap[ f ] ] ) {
        
        c[ f ] = l[ locationFieldsMap[ f ] ];

      }

    }

  }

  return c;

}


function cleanEvents( events, options ) {

  var params = utils.extend( {}, options ? options : {} );

  return events.map( function( e ) {

    return cleanEvent( svc.instanciate( e ) );

  } );

}