"use strict";

const should = require('should');
const formatEvent = require('../utils/formatEvent');

describe('11 - event-search - unit: formatEvent', function() {

  const formSchema = {
    fields: [{
      schemaId: 13,
      field: 'someAdditionalValue',
      fieldType: 'email'
    }]
  };

  const event = {
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
      begin: new Date('2020-01-18T10:05:00'),
      end: new Date('2020-01-18T18:30:00')
    }, {
      begin: new Date('2020-01-19T08:20:00'),
      end: new Date('2020-01-19T16:30:00')
    }],
    agenda: {
      uid: 123456,
      title: 'L\'agenda d\'origine je crois',
      image: 'https://fdqfdq.jpg'
    },
    someAdditionalValue: 'oa@oa.com'
  };

  let formatted;

  before(() => {
    formatted = formatEvent(event, formSchema);
  });

  it('_search_languages contains list of languages used for event', () => {
    formatted['_search_languages'].should.eql(['fr', 'en']);
  });

  it('_search_agenda is a string with info on agenda', () => {
    formatted._search_agenda.should.eql('uid:123456|title:L\'agenda d\'origine je crois|image:https://fdqfdq.jpg')
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

  it('dateRange is multilingual', () => {
    formatted.dateRange.should.eql({
      fr: '18 et 19 janvier',
      ar: '١٨ و ١٩ يناير ',
      en: '18 and 19 January',
      de: '18 und 19 Januar',
      es: '18 and 19 January'
    });
  });

  it('country labels are in document', () => {
    formatted.country.should.eql([
      'France (Metropolitan)',
      'France (Métropole)',
      'Frankreich (Metropolitan)',
      'Francia (Metropolitana)'
    ]);
  });

  it('_search_full_address_text key contains a strict with address-specific information', () => {
    formatted['_search_full_address_text'].should.equal('8 rue Alice, 92400 Courbevoie Courbevoie Ile de France Hauts-de-Seine France (Metropolitan) France (Métropole) Frankreich (Metropolitan) Francia (Metropolitana)');
  });

  it('_search_location contains coords', () => {
    formatted['_search_location'].should.eql({
      lat: 48.9076369,
      lon: 2.2836904
    });
  });

  it('additional field of email type is indexed in _search_additional_keywords', () => {
    formatted['_search_additional_keywords'].should.eql(['oa@oa.com']);
  });

});

/*it('country labels are in document', () => {
  })

  /*it('title is flattened into an array', () => {
    preParse({
      title: {
        fr: 'Un titre',
        en: 'A title'
      }
    }).should.eql( {
      title: {
        fr: 'Un titre',
        en: 'A title'
      },
      _search_title: [
        'Un titre',
        'A title'
      ]
    });
  });*/
