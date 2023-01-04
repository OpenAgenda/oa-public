'use strict';

const fs = require('fs');
const config = require('../testconfig');
const Service = require('..');

const _timeout = ms => new Promise(rs => setTimeout(rs, ms));

describe('04 - event search - functional: add', () => {
  let service;

  const eventData = {
    id: 679689,
    uid: 74367684,
    title: {
      fr: 'un nouvel événement',
      en: 'a new event',
    },
    description: {
      fr: 'Une desc courte',
      en: 'A short description',
    },
    location: {
      name: 'La boutique',
      address: '29 passage du Ponceau, Paris"',
      latitude: 48.8675959,
      longitude: 2.3516408,
      district: 'Paris 02',
      city: 'Paris',
      department: 'Paris',
      region: 'Ile-de-France',
      countryCode: 'FR',
      timezone: 'Europe/Paris',
    },
    timings: [{
      begin: new Date('2027-04-20T12:00:00+0100'),
      end: new Date('2027-04-20T13:00:00+0100'),
    }],
    timezone: 'Europe/Paris',
    state: 2,
  };

  beforeAll(async () => {
    service = Service(config);
    await service('04_add').rebuild({
      eventsList: async (lastId, limit) =>
        JSON.parse(fs.readFileSync(`${__dirname}/fixtures/04_events.${lastId}.${limit}.json`)),

    });
  });

  it('add an event to a set', async () => {
    const result = await service('04_add').add(eventData, { refresh: true });

    expect(result.success).toBe(true);

    await _timeout(1000);

    const { events, total } = await service('04_add').search({ uid: 74367684 });

    expect(total).toBe(1);

    expect(events[0].uid).toBe(74367684);
  });

  it('add nothing throws an error', async () => {
    let error;
    try {
      await service('test_index').add();
    } catch (e) {
      error = e;
    }
    expect(error.message).toBe('data is unavailable');
  });
});
