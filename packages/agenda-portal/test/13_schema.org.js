"use strict";

const should = require( 'should' );

const getTimingJSONLD = require( '../lib/timings/getSchemaJSONLD' );

describe( '13 - schema.org', () => {

  const event = {
    title: 'Exposition Florentin Brigaud le monde animalier',
    permalink: 'https://openagenda.com/agendas/36668061/events/53601020',
    description: 'Exposition temporaire dédiée aux oeuvres du sculpteur animalier Florentin Brigaud',
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

  const parsedEventJSONLD = JSON.parse( getTimingJSONLD( event, timing ) );

  describe( 'schema.org/Event', () => {
    // https://schema.org/Event

    it( 'identifier is the event page permalink when no permalink is defined for timing', () => {
      parsedEventJSONLD[ '@id' ].should.equal( 'https://openagenda.com/agendas/36668061/events/53601020' );
    } );

    it( 'url is the same as the identifier', () => {
      parsedEventJSONLD[ 'url' ].should.equal( 'https://openagenda.com/agendas/36668061/events/53601020' );
    } );

    it( 'location country code is Alpha-2 code', () => {
      parsedEventJSONLD.location.address.addressCountry.should.equal( 'FR' );
    } );

  } );

  describe( 'Google guidelines', () => {
    // https://developers.google.com/search/docs/data-types/event

    describe( 'required properties', () => {

      it( 'location is a schema.org Place', () => {
        parsedEventJSONLD.location[ '@type' ].should.equal( 'Place' );
      } );

      it( 'location.address is a schema.org PostalAddress', () => {
        parsedEventJSONLD.location.address[ '@type' ].should.equal( 'PostalAddress' );
      } );

      it( 'location.address.streetAddress is the complete street address', () => {
        parsedEventJSONLD.location.address.streetAddress.should.equal( '5 Place du Château, 45500 Gien' );
      } );

      it( 'name is a Text: the full title of the event', () => {
        parsedEventJSONLD.name.should.equal( event.title );
      } );

      it( 'The start date and start time of the event in the local timezone in UTC zone using ISO-8601 format', () => {
        parsedEventJSONLD.startDate.should.equal( '2019-06-15T08:30' );
      } );

    } );

    describe( 'recommended properties', () => {

      it( 'description - clear and concise', () => {
        parsedEventJSONLD.description.should.equal( 'Exposition temporaire dédiée aux oeuvres du sculpteur animalier Florentin Brigaud' );
      } );

      it( 'endDate - The end date and end time of the event the local timezone in UTC zone using ISO-8601 format', () => {
        parsedEventJSONLD.endDate.should.equal( '2019-06-15T09:30' );
      } );

      it( 'image is a repeated URL', () => {
        parsedEventJSONLD.image.should.eql( [ event.image ] );
      } );

      it( 'location.name is the detailed name of the place or venue where the event is being held.', () => {
        parsedEventJSONLD.location.name.should.equal( event.location.name );
      } );

      it( 'offers is a nested schema.org Offer', () => {
        parsedEventJSONLD.offers[ '@type' ].should.equal( 'Offer' );
      } );

      it( 'offers.url - The URL of a page providing the ability to buy tickets', () => {
        parsedEventJSONLD.offers.url.should.equal( 'https://www.voulez-vous.fr/' );
      } );

    } );

  } );

} );
