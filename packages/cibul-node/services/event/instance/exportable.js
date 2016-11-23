"use strict";

const range = require( 'date-range' );

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

utils = require( 'utils' );

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

    let dateRange = instance.getDateRange( true );

    w( utils.extend( {
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
        thumbnail: loaded.getThumbnail(),
        originalImage: loaded.getFullImage(),
        updatedAt: instance.updatedAt,
        age: instance.getAge(),
        accessibility: instance.getAccessibility(),
        range: {
          fr: loaded.getRange( 'fr' ),
          en: loaded.getRange( 'en' )
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

    let timezone = v.exportable.location.timezone || 'Europe/Paris';

    if ( v.filter.from ) {

      v.exportable = _filterFrom( v.exportable, v.filter.from, timezone );

    }

    if ( v.filter.to ) {

      v.exportable = _filterTo( v.exportable, v.filter.to, timezone );

    }

    if ( v.filter.from || v.filter.to ) {

      let timings = v.exportable.timings.map( t => {

        return {
          start: new Date( t.start ),
          end: new Date( t.end )
        }

      } );

      v.exportable.range = {
        fr: range( timings, 'fr', timezone ),
        en: range( timings, 'en', timezone )
      }

    }

    return v;

  }

  function _filterFrom( event, fromValue, timezone ) {

    event.timings = event.timings.filter( t => moment.tz( fromValue, timezone ).format( 'YYYY-MM-DD' ) <= moment.tz( t.start, timezone ).format( 'YYYY-MM-DD' ) );

    return event;

  }

  function _filterTo( event, toValue, timezone ) {

    event.timings = event.timings.filter( t => moment.tz( toValue, timezone ).format( 'YYYY-MM-DD' ) >= moment.tz( t.start, timezone ).format( 'YYYY-MM-DD' ) );

    return event;

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

          utils.extend( v.exportable, {
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