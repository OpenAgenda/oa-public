"use strict";

var svc,

utils = require( '../../lib/utils' ),

async = require( 'async' ),

moment = require( 'moment-timezone' ),

i18n = require( '../../i18n/i18n' ),

genUrl = require( '../genUrl' ),

registration = require( 'registration/src/validate' ).getTypesAndValues,

timeHelper = require( 'cibulTemplates' ).helpers.time,

config = require( '../../config' ),

_t = {
  fr: timeHelper( { lang: 'fr' } ),
  en: timeHelper( { lang: 'en' } ),
},

legacyLocationFieldsMap = {
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
},

locationFieldsMap = {
  uid : 'uid',
  name : 'name',
  slug : 'slug',
  address : 'address',
  image: 'image',
  imageCredits: 'imageCredits',
  postalCode : 'postcode',
  city: 'city',
  district: 'district',
  department: 'department',
  region: 'region',
  latitude: 'latitude',
  longitude: 'longitude',
  description: 'description',
  access: 'access',
  countryCode: 'countryCode',
  website: 'website',
  links: 'links',
  phone: 'phone',
  tags: 'tags',
  timezone: 'timezone',
  updatedAt: 'updatedAt'
}

module.exports = function( service ) {

  svc = service;

  return {
    cleanEvents: cleanEvents,
    clean: cleanEvent
  }

}

function cleanEvent( eInst, cb ) {

  var dateRange = eInst.getDateRange( true ),

  c = {
    uid: eInst.uid,
    slug: eInst.slug,
    canonicalUrl: genUrl( 'eventShow', { eventSlug: eInst.slug }, { protocol: 'https://' } ),
    title: eInst.title,
    description: eInst.description,
    longDescription: eInst.freeText,
    keywords: _extractKeywords( eInst ),
    html: eInst.getEnrichedFreeText( true ),
    image: eInst.getImage(),
    thumbnail: eInst.getThumbnail(),
    originalImage: eInst.getFullImage(),
    age: eInst.getAge(),
    accessibility: eInst.getAccessibility(),
    updatedAt: eInst.updatedAt,
    range: {
      fr: eInst.getRange( 'fr' ),
      en: eInst.getRange( 'en' )
    }
  },

  l = eInst.locations.length ? eInst.locations[ 0 ] : false;

  if ( l ) {

    _inject( c, l, legacyLocationFieldsMap );

    c.location = {};

    _inject( c.location, l, locationFieldsMap );

    if ( c.location.image && c.location.image.indexOf( '//' ) == -1 ) {

      c.location.image = config.aws.imageBucketPath.replace( 'https:', '' ) + c.location.image;

    }

  }

  c.registration = registration( c.registrationUrl );

  let timezone = eInst.getLocationDetails().timezone;

  eInst.getTimings( ( err, timings ) => {

    if ( err ) return cb( err );

    var t;

    utils.extend( c, {
      firstDate: null,
      firstTimeStart: null,
      firstTimeEnd: null
    } );

    if ( timings.length ) {

      t = {
        start: new Date( timings[ 0 ].start ),
        end: new Date( timings[ 0 ].end )
      };

      utils.extend( c, {
        firstDate: _stringifyDate( t.start ),
        firstTimeStart: moment.tz( t.start, timezone ).format( 'HH:mm' ),
        firstTimeEnd: moment.tz( t.end, timezone ).format( 'HH:mm' )
      });

    }

    cb( null, c );

  });

}


function _inject( c, l, map ) {

  for( var f in map ) {

    c[ f ] = null;

    if ( l[ map[ f ] ] ) {
      
      c[ f ] = l[ map[ f ] ];

    }

  }

}


function cleanEvents( events, cb ) {

  async.map( events, function( e, mcb ) {

    cleanEvent( svc.instanciate( e ), mcb );

  }, cb );

}


function _stringifyDate( d ) {

  if ( typeof d == 'string' ) d = new Date( d );

  return [ d.getFullYear(), _fZ( d.getMonth() + 1 ), _fZ( d.getDate() ) ].join( '-' );

}

function _fZ( n ) {

  return (n>9?'':'0') + n;

}

function _extractKeywords( e ) {

  if ( !e.tags ) return e.tags;

  let keywords = {};

  try {

    Object.keys( e.tags ).forEach( l => {

      keywords[ l ] = e.tags[ l ] ? e.tags[ l ].split( ',' ).map( k => k.trim() ).filter( k => k.length ) : [];

    } );

  } catch( e ) {}


  return keywords;

}