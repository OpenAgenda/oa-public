"use strict";

var i18n = require( '../../../i18n/i18n' ),

genUrl = require( '../../genUrl' ),

timeHelper = require( 'cibulTemplates' ).helpers.time,

w = require( 'when' ),

moment = require( 'moment-timezone' ),

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
  postalCode : 'postcode',
  city: 'city',
  district: 'district',
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
  'timezone' : 'timezone',
  'updatedAt' : 'updatedAt'
},

utils = require( 'utils' );

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  return {
    exportable: exportable
  }


  /**
   * format event export-ready version of the event data
   */
  
  function exportable( cb ) {

    var dateRange = instance.getDateRange( true );

    w( {
      uid: instance.uid,
      slug: instance.slug,
      canonicalUrl: genUrl( 'eventShow', { eventSlug: instance.slug }, { protocol: 'https://' } ),
      title: instance.title,
      description: instance.description,
      longDescription: instance.freeText,
      html: instance.getEnrichedFreeText( true ),
      image: loaded.getImage(),
      thumbnail: loaded.getThumbnail(),
      originalImage: loaded.getFullImage(),
      updatedAt: instance.updatedAt,
      age: instance.getAge(),
      accessibility: instance.getAccessibility(),
      range: {
        fr: loaded.getRange( 'fr' ),
        en: loaded.getRange( 'en' )
      }
    } )

    .then( _appendLocation )

    .then( _appendTimings )

    .done( v => {

      cb( null, v );

    }, cb );

  }


  function _appendTimings( v ) {

    let timezone = v.location.timezone || 'Europe/Paris';

    // add timezone in timings array for use in flat exports
    v.timings = v.timings.map( t => {

      return {
        start: t.start,
        end: t.end,
        timezone: timezone
      };

    } );

    return w.promise( ( rs, rj ) => {

      instance.getTimings( ( err, timings ) => {

        if ( err ) return rj( err );

        var t;

        utils.extend( v, {
          firstDate: null,
          firstTimeStart: null,
          firstTimeEnd: null
        } );

        if ( timings.length ) {

          t = {
            start: new Date( timings[ 0 ].start ),
            end: new Date( timings[ 0 ].end )
          };

          utils.extend( v, {
            firstDate: _stringifyDate( t.start ),
            firstTimeStart: moment.tz( t.start, timezone ).format( 'HH:mm' ),
            firstTimeEnd: moment.tz( t.end, timezone ).format( 'HH:mm' )
          } );

        }

        rs( v );

      } );

    } );


  }


  function _appendLocation( v ) {

    var l = instance.locations.length ? instance.locations[ 0 ] : false;

    if ( l ) {

      _inject( v, l, legacyLocationFieldsMap );

      v.location = {};

      _inject( v.location, l, locationFieldsMap );

    }

    return v;

  }

} );


function _stringifyDate( d ) {

  if ( typeof d == 'string' ) d = new Date( d );

  return [ d.getFullYear(), utils.fZ( d.getMonth() + 1 ), utils.fZ( d.getDate() ) ].join( '-' );

}


function _inject( c, l, map ) {

  for( var f in map ) {

    c[ f ] = null;

    if ( l[ map[ f ] ] ) {
      
      c[ f ] = l[ map[ f ] ];

    }

  }

}