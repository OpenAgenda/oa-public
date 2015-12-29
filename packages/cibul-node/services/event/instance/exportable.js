"use strict";

var i18n = require( '../../../i18n/i18n' ),

genUrl = require( '../../genUrl' ),

timeHelper = require( 'cibulTemplates' ).helpers.time,

w = require( 'when' ),

_t = {
  fr: timeHelper( { lang: 'fr' } ),
  en: timeHelper( { lang: 'en' } )
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
      longDescription: instance.getFreeText(),
      html: instance.getEnrichedFreeText(),
      image: loaded.getImage(),
      thumbnail: loaded.getThumbnail(),
      originalImage: loaded.getFullImage(),
      updatedAt: instance.updatedAt,
      range: {
        fr: i18n( dateRange[ 0 ], _t.fr( dateRange[ 1 ] ), 'fr' ).replace( ':', 'h' ),
        en: i18n( dateRange[ 0 ], _t.en( dateRange[ 1 ] ), 'en' )
      }
    } )

    .then( _appendLocation )

    .then( _appendTimings )

    .done( ( v ) => {

      cb( null, v );

    }, cb );

  }


  function _appendTimings( v ) {

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
            firstTimeStart: utils.fZ( t.start.getUTCHours() ) + ':' + utils.fZ( t.start.getMinutes() ),
            firstTimeEnd: utils.fZ( t.end.getUTCHours() ) + ':' + utils.fZ( t.end.getMinutes() )
          });

        }

        rs( v );

      } );

    } );


  }


  function _appendLocation( v ) {

    var l = instance.locations.length ? instance.locations[ 0 ] : false;

    if ( l ) {

      for ( var f in locationFieldsMap ) {

        v[ f ] = null;

        if ( l[ locationFieldsMap[ f ] ] ) {
          
          v[ f ] = l[ locationFieldsMap[ f ] ];

        }

      }

    }

    return v;

  }

} );


function _stringifyDate( d ) {

  if ( typeof d == 'string' ) d = new Date( d );

  return [ d.getFullYear(), utils.fZ( d.getMonth() + 1 ), utils.fZ( d.getDate() ) ].join( '-' );

}