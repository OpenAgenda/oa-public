'use strict';

const getTimingJSONLD = require('../lib/timings/getSchemaJSONLD');

describe('13 - schema.org', () => {
  const event = {
    title: 'Exposition Florentin Brigaud le monde animalier',
    permalink: 'https://openagenda.com/agendas/36668061/events/53601020',
    description:
      'Exposition temporaire dédiée aux oeuvres du sculpteur animalier Florentin Brigaud',
    registration: [
      {
        type: 'link',
        value: 'https://www.voulez-vous.fr/'
      },
      {
        type: 'email',
        value: 'contact@brigaud.fr'
      }
    ],
    image:
      'https://cibul.s3.amazonaws.com/73a0e0e58db448ffbd6e21dee5151642.base.image.jpg',
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
    timings: [
      {
        start: '2019-06-15T06:30:00.000Z',
        end: '2019-06-15T07:30:00.000Z'
      }
    ]
  };

  const timing = event.timings[0];

  const parsedEventJSONLD = JSON.parse(getTimingJSONLD(event, timing));

  describe('schema.org/Event', () => {
    // https://schema.org/Event

    it('identifier is the event page permalink when no permalink is defined for timing', () => {
      expect(parsedEventJSONLD['@id']).toBe(
        'https://openagenda.com/agendas/36668061/events/53601020'
      );
    });

    it('url is the same as the identifier', () => {
      expect(parsedEventJSONLD.url).toBe(
        'https://openagenda.com/agendas/36668061/events/53601020'
      );
    });

    it('location country code is Alpha-2 code', () => {
      expect(parsedEventJSONLD.location.address.addressCountry).toBe('FR');
    });
  });

  describe('Google guidelines', () => {
    // https://developers.google.com/search/docs/data-types/event

    describe('required properties', () => {
      it('location is a schema.org Place', () => {
        expect(parsedEventJSONLD.location['@type']).toBe('Place');
      });

      it('location.address is a schema.org PostalAddress', () => {
        expect(parsedEventJSONLD.location.address['@type']).toBe(
          'PostalAddress'
        );
      });

      it('location.address.streetAddress is the complete street address', () => {
        expect(parsedEventJSONLD.location.address.streetAddress).toBe(
          '5 Place du Château, 45500 Gien'
        );
      });

      it('name is a Text: the full title of the event', () => {
        expect(parsedEventJSONLD.name).toBe(event.title);
      });

      it('The start date and start time of the event in the local timezone in UTC zone using ISO-8601 format', () => {
        expect(parsedEventJSONLD.startDate).toBe('2019-06-15T08:30');
      });
    });

    describe('recommended properties', () => {
      it('description - clear and concise', () => {
        expect(parsedEventJSONLD.description).toBe(
          'Exposition temporaire dédiée aux oeuvres du sculpteur animalier Florentin Brigaud'
        );
      });

      it('endDate - The end date and end time of the event the local timezone in UTC zone using ISO-8601 format', () => {
        expect(parsedEventJSONLD.endDate).toBe('2019-06-15T09:30');
      });

      it('image is a repeated URL', () => {
        expect(parsedEventJSONLD.image).toEqual([event.image]);
      });

      it('location.name is the detailed name of the place or venue where the event is being held.', () => {
        expect(parsedEventJSONLD.location.name).toBe(event.location.name);
      });

      it('offers is a nested schema.org Offer', () => {
        expect(parsedEventJSONLD.offers['@type']).toBe('Offer');
      });

      it('offers.url - The URL of a page providing the ability to buy tickets', () => {
        expect(parsedEventJSONLD.offers.url).toBe(
          'https://www.voulez-vous.fr/'
        );
      });
    });
  });
});
