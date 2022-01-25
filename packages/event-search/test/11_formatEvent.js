"use strict";

const { produce } = require('immer');
const assert = require('assert');
const should = require('should');
const formatEvent = require('../utils/formatEvent');

describe('11 - event-search - unit: formatEvent', function() {

  const formSchema = {
    fields: [{
      schemaId: 13,
      field: 'someAdditionalValue',
      fieldType: 'email'
    }, {
      schemaId: 13,
      field: 'someAdditionalPlaces',
      fieldType: 'integer'
    }, {
      schemaId: 13,
      field: 'someAdditionalPrice',
      fieldType: 'number'
    }]
  };

  const event = {
    createdAt: new Date('2020-04-28T13:44:00+0200'),
    updatedAt: new Date('2020-04-28T14:50:00+0200'),
    title: {
      fr: 'Un événement',
      en: 'An event'
    },
    timezone: 'Europe/Paris',
    location: {
      address: '8 rue Alice, 92400 Courbevoie',
      city: 'Courbevoie',
      region: 'Ile de France',
      department: 'Hauts-de-Seine',
      countryCode: 'FR',
      latitude: 48.9076369,
      longitude: 2.2836904,
      timezone: 'Europe/Paris'
    },
    timings: [{
      begin: new Date('2020-01-18T10:05:00+0100'),
      end: new Date('2020-01-18T18:30:00+0100')
    }, {
      begin: new Date('2020-01-19T08:20:00+0100'),
      end: new Date('2020-01-19T16:30:00+0100')
    }],
    conditions: {
      fr: 'Gratuit',
      en: 'Free'
    },
    status: 5,
    originAgenda: {
      uid: 123456,
      title: 'L\'agenda d\'origine je crois',
      image: 'https://fdqfdq.jpg'
    },
    registration: ['an@email.com', 'https://a.link.com', '08392878923'],
    sourceAgendas: [{
      uid: 7891011,
      title: 'Un agenda source',
      'image': null
    }],
    someAdditionalValue: 'oa@oa.com',
    someAdditionalPrice: 29.99,
    someAdditionalPlaces: 5
  };

  let formatted;

  before(() => {
    formatted = formatEvent(event, { formSchema });
  });

  it('_search_languages contains list of languages used for event', () => {
    formatted['_search_languages'].should.eql(['fr', 'en']);
  });

  it('additional value is in formatted data', () => {
    formatted.someAdditionalValue.should.equal('oa@oa.com');
  });

  it('additional value is null if is not in formatted data', () => {
    const eventWithNoAdditionalValue = produce(event, draft => {
      delete draft.someAdditionalValue;
    });

    const formatted = formatEvent(eventWithNoAdditionalValue, { formSchema });

    should(formatted.someAdditionalValue).equal(null);
  });

  it('additional value is empty array if is not in formatted data and field is of list type (radio)', () => {
    const eventWithNoAdditionalValue = produce(event, draft => {
      delete draft.someAdditionalValue;
    });

    const formatted = formatEvent(eventWithNoAdditionalValue, {
      formSchema: {
        fields: [{
          schemaId: 123,
          field: 'someAdditionalValue',
          fieldType: 'radio',
        }]
      }
    });

    should(formatted.someAdditionalValue).eql([]);
  });

  it('originAgenda._agg is a string with info on agenda', () => {
    formatted.originAgenda._agg.should.eql('eyJ1aWQiOjEyMzQ1NiwidGl0bGUiOiJMJ2FnZW5kYSBkJ29yaWdpbmUgamUgY3JvaXMiLCJpbWFnZSI6Imh0dHBzOi8vZmRxZmRxLmpwZyJ9')
  });

  it('sourceAgendas[]._agg is a string with info on the agenda', () => {
    formatted.sourceAgendas[0]._agg.should.eql('eyJ1aWQiOjc4OTEwMTEsInRpdGxlIjoiVW4gYWdlbmRhIHNvdXJjZSIsImltYWdlIjpudWxsfQ==');
  });

  it('_search_title contains the titles of the event', () => {
    formatted['_search_title'].should.eql(['Un événement', 'An event']);
  });

  it('timings._search_begin_from_midnight counts the seconds between the timing start and when the day began', () => {
    formatted.timings[0]._search_begin_from_midnight.should.equal(36300);
  });

  it('_search_last_timing hold the end of the last timing', () => {
    formatted['_search_last_timing'].getTime().should.equal(event.timings[1].end.getTime());
  });

  it('registration should be indexed with a type', () => {
    formatted.registration.should.eql([
      { value: 'an@email.com', type: 'email' },
      { value: 'https://a.link.com', type: 'link' },
      { value: '08392878923', type: 'phone' }
    ]);
  });

  it('dateRange is multilingual', () => {
    formatted.dateRange.should.eql({
      fr: '18 et 19 janvier 2020',
      ar: '١٨ و ١٩ يناير ٢٠٢٠ ',
      en: '18 and 19 January 2020',
      de: '18 und 19 Januar 2020',
      es: '18 and 19 January 2020'
    });
  });

  it('country labels are in document', () => {
    formatted.country.should.eql({
      en: 'France (Metropolitan)',
      fr: 'France (Métropole)',
      de: 'Frankreich (Metropolitan)',
      es: 'Francia (Metropolitana)',
      it: 'Francia (continente)'
    });
  });

  it('status is set', () => {
    assert.equal(formatted.status, 5);
  });

  it('_search_full_address_text key contains a strict with address-specific information', () => {
    formatted['_search_full_address_text']
      .should.equal('8 rue Alice, 92400 Courbevoie Courbevoie Ile de France Hauts-de-Seine France (Metropolitan) France (Métropole) Frankreich (Metropolitan) Francia (Metropolitana) Francia (continente)');
  });

  it('_search_location contains coords', () => {
    formatted['_search_location'].should.eql({
      lat: 48.9076369,
      lon: 2.2836904
    });
  });

  it('_search_additional_numbers contains values coming from additional fields of number or integer types', () => {
    formatted['_search_additional_numbers'].should.eql([
      { fieldName: 'someAdditionalPlaces', integer: 5, number: 5 },
      { fieldName: 'someAdditionalPrice', integer: 29, number: 29.99 }
    ]);
  });

  it('additional field of email type is indexed in _search_additional_keywords', () => {
    formatted['_search_additional_keywords'].should.eql(['oa@oa.com']);
  });

  it('timestamps createdAt and updatedAt are in formatted object', () => {
    formatted.createdAt.should.be.ok;
    formatted.updatedAt.should.be.ok;
  });

  it('timestamp _exclusiveUpdatedAt is unset if updatedAt is less than 1mn appart from createdAt', () => {
    const newEvent = produce(event, draft => {
      draft.createdAt = new Date('2020-05-11T15:25:30+0200');
      draft.updatedAt = new Date('2020-05-11T15:26+0200');
    });
    
    should(formatEvent(newEvent, { formSchema })._exclusiveUpdatedAt).equal(undefined);
  });

  it('fix: registration already with type is handled', () => {
    const newEvent = produce(event, draft => {
      draft.registration = [
        { value: 'an@email.com', type: 'email' },
        { value: 'https://a.link.com', type: 'link' },
        { value: '08392878923', type: 'phone' }
      ];
    });

    formatEvent(newEvent).registration.should.eql([
      { value: 'an@email.com', type: 'email' },
      { value: 'https://a.link.com', type: 'link' },
      { value: '08392878923', type: 'phone' }
    ]);
  });

  it('timestamp _exclusiveUpdatedAt is set if updatedAt is 1mn appart or more from createdAt', () => {
    const eventWithUpdate = produce(event, draft => {
      draft.createdAt = new Date('2020-05-11T15:25:30+0200');
      draft.updatedAt = new Date('2020-05-11T15:27+0200'); 
    });
    
    formatEvent(eventWithUpdate, { formSchema })._exclusiveUpdatedAt.getTime().should.equal((new Date('2020-05-11T15:27+0200')).getTime());
  });

});
