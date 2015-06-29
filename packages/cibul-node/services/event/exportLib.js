"use strict";

var svc,

utils = require( '../../lib/utils' ),

async = require( 'async' ),

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

function cleanEvent( eInst, cb ) {

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

  eInst.getTimings( function( err, timings ) {

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
        firstTimeStart: _fZ( t.start.getUTCHours() ) + ':' + _fZ( t.start.getMinutes() ),
        firstTimeEnd: _fZ( t.end.getUTCHours() ) + ':' + _fZ( t.end.getMinutes() )
      });

    }

    cb( null, c );

  });

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