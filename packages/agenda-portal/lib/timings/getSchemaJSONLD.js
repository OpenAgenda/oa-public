"use strict";

const getJSONDuration = require( './getJSONDuration' );

module.exports = ( event, { start, end } ) => JSON.stringify( {
  '@context': 'http://schema.org',
  '@type' : 'Event',
  name : event.title,
  description : event.description,
  url : event.share.permalink,
  ... event.image ? { image: event.image } : {},
  start,
  end,
  duration: getJSONDuration( start, end ),
  ... event.registration.length ? {
    offers: event.registration.filter( r => r.type === 'link' ).map( l => ( {
      '@type': 'Offer',
      url: l.value
    } ) )
  } : {},
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
