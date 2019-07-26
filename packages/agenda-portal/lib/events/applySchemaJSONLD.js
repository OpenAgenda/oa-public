"use strict";

const _ = require( 'lodash' );
const tz = require( 'moment-timezone' ).tz;

const getTimingsSchemaJSONLD = require( '../timings/getSchemaJSONLD' );

module.exports = event => {

  return {
    ... event,
    JSONLD: get( event )
  }

}

function get( event ) {

  if ( event.timings.length === 1 ) {
    return getTimingsSchemaJSONLD( event, event.timings[ 0 ] );
  }

  const startDate = tz(
    event.timings[ 0 ].start,
    _.get( event, 'location.timezone', 'Europe/Paris' )
  ).format( 'YYYY-MM-DDTHH:mm' );

  const endDate = tz(
    _.get( _.last( event.timings ), 'end' ),
    _.get( event, 'location.timezone', 'Europe/Paris' )
  ).format( 'YYYY-MM-DDTHH:mm' );

  return JSON.stringify( {
    '@context': 'http://schema.org',
    '@type' : 'Event',
    name : event.title,
    description : event.description,
    url : event.share.permalink,
    ... event.image ? { image: event.image } : {},
    startDate,
    endDate,
    ... event.registration.length ? {
      offers: event.registration.filter( r => r.type === 'link' ).map( l => ( {
        '@type': 'Offer',
        url: l.value
      } ) )
    } : {},
    ... event.age ? { typicalAgeRange: [
      event.age.min,
      event.age.max
    ].join( '-' ) } : {},
    location : {
      '@type': 'Place',
      name : event.location.name,
      address: {
        '@type' : 'PostalAddress',
        streetAddress : event.location.address,
        addressLocality : event.location.city,
        addressRegion : event.location.region,
        postalCode : event.location.postalCode,
        addressCountry : event.location.countryCode
      },
      geo : {
        '@type' : 'GeoCoordinates',
        latitude : event.location.latitude,
        longitude : event.location.longitude
      }
    }
  }, null, 2 );

}
