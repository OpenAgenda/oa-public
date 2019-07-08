"use strict";

const should = require( 'should' );

const getTimingJSONLD = require( '../lib/timings/getSchemaJSONLD' );

describe( '13 schema.org', () => {

  describe( 'timings', () => {

    it( 'provides a JSON-LD for the provided timing of a provided event', () => {

      const event = {
        title: 'Exposition Florentin Brigaud le monde animalier',
        description: 'Exposition temporaire dédiée aux oeuvres du sculpteur animalier Florentin Brigaud',
        share: {
          permalink: 'https://openagenda.com/agendas/36668061/events/53601020'
        },
        registration: [ {
          type: 'link',
          value: 'https://www.voulez-vous.fr/'
        }, {
          type: 'email',
          value: 'contact@brigaud.fr'
        } ],
        image: 'https://cibul.s3.amazonaws.com/73a0e0e58db448ffbd6e21dee5151642.base.image.jpg',
        location: {
          name: 'Château-musée de Gien',
          address: '5 Place du Château, 45500 Gien',
          city: 'Gien',
          region: 'Centre-Val de Loire',
          postalCode: '45500',
          countryCode: 'FR',
          latitude: 47.685759,
          longitude: 2.630589,
          timezone: 'Europe/Paris'
        },
        timings: [ {
          start: '2019-06-15T06:30:00.000Z',
          end: '2019-06-15T07:30:00.000Z',
        } ]
      }

      const timing = event.timings[ 0 ];

      getTimingJSONLD( event, timing ).should.eql( `{
  "@context": "http://schema.org",
  "@type": "Event",
  "name": "Exposition Florentin Brigaud le monde animalier",
  "description": "Exposition temporaire dédiée aux oeuvres du sculpteur animalier Florentin Brigaud",
  "url": "https://openagenda.com/agendas/36668061/events/53601020",
  "image": "https://cibul.s3.amazonaws.com/73a0e0e58db448ffbd6e21dee5151642.base.image.jpg",
  "start": "2019-06-15T06:30:00.000Z",
  "end": "2019-06-15T07:30:00.000Z",
  "duration": "PT1H",
  "offers": [
    {
      "@type": "Offer",
      "url": "https://www.voulez-vous.fr/"
    }
  ],
  "location": {
    "@type": "Place",
    "name": "Château-musée de Gien",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "5 Place du Château, 45500 Gien",
      "addressLocality": "Gien",
      "addressRegion": "Centre-Val de Loire",
      "postalCode": "45500",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 47.685759,
      "longitude": 2.630589
    }
  }
}` );

    } );

  } );

} );
