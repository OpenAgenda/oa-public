"use strict";

const pickEventImage = require( '../lib/pickImage' );

const range = require( '@openagenda/date-range' ),

  filterTimings = require( './filterTimings' ),

  utils = require( '@openagenda/utils' ),

  genUrl = require( '../../genUrl' ),

  config = require( '../../../config' ),

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
    'timezone' : 'timezone',
    'updatedAt' : 'updatedAt'
  },

  _ = require( 'lodash' );

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  return {
    exportable
  }


  /**
   * format event export-ready version of the event data
   */

  function exportable( options, cb ) {

    if ( arguments.length === 1 ) {

      cb = options;
      options = {};

    }

    try {
      const dateRange = instance.getDateRange( true );
    } catch ( e ) {
      return cb( e );
    }

    w( _.extend( {
      protocol: null,
      filter: false,
      exportable: {
        uid: instance.uid,
        slug: instance.slug,
        canonicalUrl: genUrl( 'eventShow', { eventSlug: instance.slug }, { protocol: 'https://' } ),
        title: instance.title,
        description: instance.description,
        longDescription: instance.freeText,
        keywords: _cleanKeywords( instance.tags ),
        html: instance.getEnrichedFreeText( true ),
        image: loaded.getImage(),
        imageCredits: instance.imageCredits,
        thumbnail: pickEventImage( config, instance, 'thumbnail' ),
        originalImage: pickEventImage( config, instance, 'full' ),
        updatedAt: instance.updatedAt,
        createdAt: instance.createdAt,
        age: instance.getAge(),
        accessibility: instance.getAccessibility(),
        origin: instance.origin,
        range: {
          fr: loaded.getRange( 'fr' ),
          en: loaded.getRange( 'en' ),
          de: loaded.getRange( 'de' )
        }
      }
    }, options ) )

    .then( _appendLocation )

    .then( _appendTimings )

    .then( _adjustProtocol )

    .then( _filter )

    .done( v => {

      cb( null, v.exportable );

    }, cb );

  }


  function _filter( v ) {

    if ( !v.filter ) return v;

    if ( !v.filter.from && !v.filter.to ) return v;

    let timezone = v.exportable.location.timezone || 'Europe/Paris';

    let timings = filterTimings(
      v.exportable.timings,
      v.filter,
      timezone
    ).map( t => ( {
      start: new Date( t.start ),
      end: new Date( t.end )
    } ) );

    v.exportable.range = {
      fr: range( timings, 'fr', timezone ),
      en: range( timings, 'en', timezone )
    }

    return v;

  }


  function _adjustProtocol( v ) {

    if ( v.protocol === null ) return v;

    if ( v.exportable.image ) {

      v.exportable.image = _protocol( v.protocol, v.exportable.image );

    }

    if ( v.exportable.location && v.exportable.location.image ) {

      v.exportable.location.image = _protocol( v.protocol, v.exportable.location.image );

    }

    return v;

  }


  function _appendTimings( v ) {

    let timezone = v.exportable.location.timezone || 'Europe/Paris';

    // add timezone in timings array for use in flat exports
    v.timings = v.exportable.timings.map( t => {

      return {
        start: t.start,
        end: t.end,
        timezone: timezone
      };

    } );

    return w.promise( ( rs, rj ) => {

      instance.getTimings( ( err, timings ) => {

        if ( err ) return rj( err );

        let tFirst, tLast;

        _.extend( v.exportable, {
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

          _.extend( v.exportable, {
            firstDate: _stringifyDate( tFirst.start ),
            firstTimeStart: moment.tz( tFirst.start, timezone ).format( 'HH:mm' ),
            firstTimeEnd: moment.tz( tFirst.end, timezone ).format( 'HH:mm' ),
            lastDate: _stringifyDate( tLast.start ),
            lastTimeStart: moment.tz( tLast.start, timezone ).format( 'HH:mm' ),
            lastTimeEnd: moment.tz( tLast.end, timezone ).format( 'HH:mm' )
          } );

        }

        rs( v );

      } );

    } );


  }


  function _appendLocation( v ) {

    var l = instance.locations.length ? instance.locations[ 0 ] : false;

    if ( l ) {

      _inject( v.exportable, l, legacyLocationFieldsMap );

      v.exportable.location = {};

      _inject( v.exportable.location, l, locationFieldsMap );

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


function _cleanKeywords( dirty ) {

  if ( !dirty || typeof dirty !== 'object' ) return;

  let clean = {};

  Object.keys( dirty ).forEach( k => {

    clean[ k ] = ( dirty[ k ] || '' ).split( ',' ).map( t => t.trim() ).filter( t => t.length ).join( ', ' );

  } );

  return clean;

}

function _protocol( p, s ) { return s.replace( /^(http:\/\/|https:\/\/|\/\/)/, p + '//' ) }
