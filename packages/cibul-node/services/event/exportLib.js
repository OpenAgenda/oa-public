"use strict";

const pickEventImage = require( './lib/pickImage' );

const _ = require( 'lodash' ),

  async = require( 'async' ),

  moment = require( 'moment-timezone' ),

  i18n = require( '../../i18n/i18n' ),

  genUrl = require( '../genUrl' ),

  registration = require( '@openagenda/registration/src/validate' ).getTypesAndValues,

  timeHelper = require( '@openagenda/cibul-templates' ).helpers.time,

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
    insee: 'insee',
    phone: 'phone',
    tags: 'tags',
    timezone: 'timezone',
    updatedAt: 'updatedAt',
    extId: 'extId'
  }

let svc;

module.exports = service => {

  svc = service;

  return {
    cleanEvents,
    clean: cleanEvent
  }

}


function cleanEvent( eInst, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;

    options = {};

  }

  const dateRange = eInst.getDateRange( true );

  const c = {
    uid: eInst.uid,
    slug: eInst.slug,
    canonicalUrl: genUrl( 'eventShow', { eventSlug: eInst.slug }, { protocol: 'https://' } ),
    title: eInst.title,
    description: eInst.description,
    longDescription: eInst.freeText,
    keywords: _extractKeywords( eInst ),
    html: eInst.getEnrichedFreeText( { allLanguages: true, includeLinks: options.includeEmbedded } ),
    image: eInst.getImage(),
    thumbnail: pickEventImage( config, eInst, 'thumbnail' ),
    originalImage: pickEventImage( config, eInst, 'full' ),
    age: eInst.getAge(),
    accessibility: eInst.getAccessibility(),
    updatedAt: eInst.updatedAt,
    createdAt: eInst.createdAt,
    range: {
      fr: eInst.getRange( 'fr' ),
      en: eInst.getRange( 'en' )
    }
  };

  const l = eInst.locations.length ? eInst.locations[ 0 ] : false;

  if ( c.image ) {

    c.imageCredits = eInst.imageCredits || null;

  }

  if ( eInst.origin ) {

    c.origin = eInst.origin;

    c.origin.oaUrl =  genUrl( 'agendaRedirect', { uid : c.origin.uid }, { protocol: 'https://' } );

  }

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

    let tFirst, tLast;

    _.extend( c, {
      firstDate: null,
      firstTimeStart: null,
      firstTimeEnd: null,
      lastDate: null,
      lastTimeStart: null,
      lastTimeEnd: null
    } );

    if ( timings.length ) {

      tFirst = {
        start: new Date( timings[ 0 ].start ),
        end: new Date( timings[ 0 ].end )
      };

      tLast = {
        start: new Date( timings[ timings.length - 1 ].start ),
        end: new Date( timings[ timings.length - 1 ].end )
      };

      _.extend( c, {
        firstDate: _stringifyDate( tFirst.start ),
        firstTimeStart: moment.tz( tFirst.start, timezone ).format( 'HH:mm' ),
        firstTimeEnd: moment.tz( tFirst.end, timezone ).format( 'HH:mm' ),
        lastDate: _stringifyDate( tLast.start ),
        lastTimeStart: moment.tz( tLast.start, timezone ).format( 'HH:mm' ),
        lastTimeEnd: moment.tz( tLast.end, timezone ).format( 'HH:mm' )
      } );

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


function cleanEvents( events, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  async.map( events, function( e, mcb ) {

    cleanEvent( svc.instanciate( e ), options, mcb );

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
