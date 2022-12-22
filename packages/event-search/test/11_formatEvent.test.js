'use strict';

const { produce } = require('immer');
const formatEvent = require('../utils/formatEvent');

describe('11 - event-search - unit: formatEvent', () => {
  const formSchema = {
    fields: [{
      schemaId: 13,
      field: 'someAdditionalValue',
      fieldType: 'email',
    }, {
      schemaId: 13,
      field: 'someAdditionalPlaces',
      fieldType: 'integer',
    }, {
      schemaId: 13,
      field: 'someAdditionalPrice',
      fieldType: 'number',
    }, {
      schemaId: 13,
      field: 'someAdditionalOptions',
      fieldType: 'radio',
      options: [{
        id: 1,
        label: 'One',
      }, {
        id: 2,
        label: 'Two',
      }],
    }, {
      schemaId: 13,
      field: 'somAdditionalBoolean',
      fieldType: 'boolean',
    }],
  };

  const event = {
    createdAt: new Date('2020-04-28T13:44:00+0200'),
    updatedAt: new Date('2020-04-28T14:50:00+0200'),
    title: {
      fr: 'Un événement',
      en: 'An event',
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
      timezone: 'Europe/Paris',
    },
    keywords: {
      fr: ['jazz', 'restaurant', 'diner', 'theatre'],
      en: ['jazz', 'theater'],
    },
    accessibility: {
      vi: false,
      hi: true,
      ii: true,
    },
    timings: [{
      begin: new Date('2020-01-18T10:05:00+0100'),
      end: new Date('2020-01-18T18:30:00+0100'),
    }, {
      begin: new Date('2020-01-19T08:20:00+0100'),
      end: new Date('2020-01-19T16:30:00+0100'),
    }],
    conditions: {
      fr: 'Gratuit',
      en: 'Free',
    },
    status: 5,
    originAgenda: {
      uid: 123456,
      title: 'L\'agenda d\'origine je crois',
      image: 'https://fdqfdq.jpg',
    },
    registration: ['an@email.com', 'https://a.link.com', '08392878923'],
    sourceAgendas: [{
      uid: 7891011,
      title: 'Un agenda source',
      image: null,
    }],
    someAdditionalValue: 'oa@oa.com',
    someAdditionalPrice: 29.99,
    someAdditionalPlaces: 5,
    somAdditionalBoolean: true,
  };

  let formatted;

  beforeAll(() => {
    formatted = formatEvent(event, { formSchema });
  });

  it('_search_languages contains list of languages used for event', () => {
    expect(formatted._search_languages).toEqual(['fr', 'en']);
  });

  it('_search_empty_fields contains list of fields that are empty', () => {
    expect(formatted._search_empty_fields).toEqual([
      'location.name',
      'location.adminLevel3',
      'location.adminLevel5',
      'location.district',
      'description',
      'member',
      'someAdditionalOptions',
    ]);
  });

  it('additional value is in formatted data', () => {
    expect(formatted.someAdditionalValue).toBe('oa@oa.com');
  });

  it('originAgenda._agg is a string with info on agenda', () => {
    expect(formatted.originAgenda._agg).toEqual('eyJ1aWQiOjEyMzQ1NiwidGl0bGUiOiJMJ2FnZW5kYSBkJ29yaWdpbmUgamUgY3JvaXMiLCJpbWFnZSI6Imh0dHBzOi8vZmRxZmRxLmpwZyJ9');
  });

  it('sourceAgendas[]._agg is a string with info on the agenda', () => {
    expect(formatted.sourceAgendas[0]._agg).toEqual('eyJ1aWQiOjc4OTEwMTEsInRpdGxlIjoiVW4gYWdlbmRhIHNvdXJjZSIsImltYWdlIjpudWxsfQ==');
  });

  it('_search_title contains the titles of the event', () => {
    expect(formatted._search_title).toEqual(['Un événement', 'An event']);
  });

  it(
    'timings._search_begin_from_midnight counts the seconds between the timing start and when the day began',
    () => {
      expect(formatted.timings[0]._search_begin_from_midnight).toBe(36300);
    },
  );

  it('_search_last_timing hold the end of the last timing', () => {
    expect(formatted._search_last_timing.getTime()).toBe(event.timings[1].end.getTime());
  });

  it('_search_keywords includes keywords from all languages', () => {
    for (const keyword of ['jazz', 'restaurant', 'diner', 'theatre', 'theater']) {
      expect(formatted._search_keywords.flat().includes(keyword)).toBe(true);
    }
  });

  it('_search_keywords includes accessibility keys', () => {
    for (const accKey of ['accessibility.hi', 'accessibility.ii']) {
      expect(formatted._search_keywords.flat().includes(accKey)).toBeTruthy();
    }
  });

  it('registration should be indexed with a type', () => {
    expect(formatted.registration).toEqual([
      { value: 'an@email.com', type: 'email' },
      { value: 'https://a.link.com', type: 'link' },
      { value: '08392878923', type: 'phone' },
    ]);
  });

  it('dateRange is multilingual', () => {
    expect(formatted.dateRange).toEqual({
      fr: '18 et 19 janvier 2020',
      ar: '١٨ و ١٩ يناير ٢٠٢٠ ',
      en: '18 and 19 January 2020',
      de: '18 und 19 Januar 2020',
      es: '18 i 19 enero 2020',
      it: '18 e 19 gennaio 2020',
    });
  });

  it('country labels are in document', () => {
    expect(formatted.country).toEqual({
      en: 'France (Metropolitan)',
      fr: 'France (Métropole)',
      de: 'Frankreich (Metropolitan)',
      es: 'Francia (Metropolitana)',
      it: 'Francia (continente)',
      oc: 'França (Metropolitana)',
    });
  });

  it('status is set', () => {
    expect(formatted.status).toBe(5);
  });

  it(
    '_search_full_address_text key contains a strict with address-specific information',
    () => {
      expect(
        formatted._search_full_address_text,
      ).toBe('8 rue Alice, 92400 Courbevoie Courbevoie Ile de France Hauts-de-Seine France (Metropolitan) France (Métropole) Frankreich (Metropolitan) Francia (Metropolitana) Francia (continente) França (Metropolitana)');
    },
  );

  it('_search_location contains coords', () => {
    expect(formatted._search_location).toEqual({
      lat: 48.9076369,
      lon: 2.2836904,
    });
  });

  it(
    '_search_additional_numbers contains values coming from additional fields of number or integer types',
    () => {
      expect(formatted._search_additional_numbers).toEqual([
        { fieldName: 'someAdditionalPlaces', integer: 5, number: 5 },
        { fieldName: 'someAdditionalPrice', integer: 29, number: 29.99 },
      ]);
    },
  );

  it(
    'additional field of email type is indexed in _search_additional_keywords',
    () => {
      expect(formatted._search_additional_keywords.includes('oa@oa.com')).toBe(true);
    },
  );

  it(
    'additional field of boolean type is indexed in _search_additional_keywords',
    () => {
      expect(formatted._search_additional_keywords.includes('13.somAdditionalBoolean.true')).toBe(true);
    },
  );

  it('timestamps createdAt and updatedAt are in formatted object', () => {
    expect(formatted.createdAt).toBeDefined();
    expect(formatted.updatedAt).toBeDefined();
  });

  it(
    'timestamp _exclusiveUpdatedAt is unset if updatedAt is less than 1mn appart from createdAt',
    () => {
      const newEvent = produce(event, draft => {
        draft.createdAt = new Date('2020-05-11T15:25:30+0200');
        draft.updatedAt = new Date('2020-05-11T15:26+0200');
      });

      expect(formatEvent(newEvent, { formSchema })._exclusiveUpdatedAt).toBeUndefined();
    },
  );

  it(
    'if member contains contactName, it is used as name in member data',
    () => {
      expect(formatEvent(produce(event, draft => {
        draft.member = {
          custom: {
            contactName: 'Elf',
          },
        };
        draft.user = {
          fullName: 'Inashelf',
        };
      })).member.name).toBe('Elf');
    },
  );

  it(
    'if member does not contain contactName, user fullName is used as member name',
    () => {
      expect(formatEvent(produce(event, draft => {
        draft.member = {
          custom: {
            contactName: null,
          },
        };
        draft.user = {
          fullName: 'Inashelf',
        };
      })).member.name).toBe('Inashelf');
    },
  );

  it('fix: registration already with type is handled', () => {
    const newEvent = produce(event, draft => {
      draft.registration = [
        { value: 'an@email.com', type: 'email' },
        { value: 'https://a.link.com', type: 'link' },
        { value: '08392878923', type: 'phone' },
      ];
    });

    expect(formatEvent(newEvent).registration).toEqual([
      { value: 'an@email.com', type: 'email' },
      { value: 'https://a.link.com', type: 'link' },
      { value: '08392878923', type: 'phone' },
    ]);
  });

  it('fix: formatEvent is tolerant of null registration', () => {
    const newEvent = produce(event, draft => {
      draft.registration = [null];
    });

    expect(formatEvent(newEvent).registration).toEqual([]);
  });

  it(
    'timestamp _exclusiveUpdatedAt is set if updatedAt is 1mn appart or more from createdAt',
    () => {
      const eventWithUpdate = produce(event, draft => {
        draft.createdAt = new Date('2020-05-11T15:25:30+0200');
        draft.updatedAt = new Date('2020-05-11T15:27+0200');
      });

      expect(formatEvent(eventWithUpdate, { formSchema })._exclusiveUpdatedAt.getTime()).toBe(new Date('2020-05-11T15:27+0200').getTime());
    },
  );
});
