'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

const fixtures = JSON.parse(
  fs.readFileSync(`${__dirname}/fixtures/02_events.optioned_additional.json`),
);

describe('02 - event search - functional: search in optioned additional fields', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) {
      // console.log(e);
    }
  });

  beforeAll(async () => {
    await service('additional').rebuild({
      eventsList: async (_lastId, _limit) => fixtures.data,
      formSchema: fixtures.formSchema,
    });
  });

  it('filters on additional field option', async () => {
    const { events } = await service('additional').search({
      'categories-agenda-metropolitain': 43,
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true,
    });

    expect(events.length).toBe(1);
    expect(events[0]['categories-agenda-metropolitain']).toBe(43);
  });

  it('filters on multiple additional field values', async () => {
    const { events } = await service('additional').search({
      'categories-agenda-metropolitain': [43, 46],
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true,
    });

    expect(events.length).toBe(2);
    expect(events.map(e => e.uid)).toEqual([1, 2]);
  });

  it('empty list passed to additional field filter is ignored', async () => {
    const { total } = await service('additional').search({
      'categories-agenda-metropolitain': [],
    }, {}, {
      formSchema: fixtures.formSchema,
      detailed: true,
    });

    expect(total).toBeGreaterThan(0);
  });

  it(
    'filters on absence of value set for specific additional field',
    async () => {
      const { events } = await service('additional').search({
        state: 2,
        'categories-agenda-metropolitain': 'null',
      }, {}, {
        formSchema: fixtures.formSchema,
        detailed: true,
      });

      expect(events.length).toBe(1);
      expect(events[0]['categories-agenda-metropolitain']).toBeUndefined();
    },
  );

  it(
    'filters on absence of value AND existing value set for specific additional field',
    async () => {
      const { events } = await service('additional').search({
        state: 2,
        'categories-agenda-metropolitain': ['null', 43],
      }, {}, {
        formSchema: fixtures.formSchema,
        detailed: true,
      });

      expect(events.length).toBe(2);
      expect(events.map(e => e.uid)).toEqual([2, 3]);
    },
  );

  it(
    'aggregation on additional field provides count for events with unspecified values',
    async () => {
      const { aggregations } = await service('additional').search({
        state: null,
      }, { size: 0 }, {
        formSchema: fixtures.formSchema,
        detailed: true,
        aggregations: [{
          key: 'littleFurryBunny',
          field: 'categories-agenda-metropolitain',
          type: 'additionalFields',
          missing: 'N/A',
        }],
      });

      expect(aggregations).toEqual({
        littleFurryBunny: [
          {
            key: 'N/A',
            eventCount: 1,
          },
          {
            id: 43,
            key: 43,
            value: 'atelier',
            label: {
              fr: 'Atelier',
            },
            eventCount: 1,
          },
          {
            id: 46,
            key: 46,
            value: 'concert',
            label: {
              fr: 'Concert',
            },
            eventCount: 1,
          },
        ],
      });
    },
  );

  it(
    'aggregation on additional field without options don\'t throw an error',
    async () => {
      const { aggregations } = await service('additional').search({
        state: null,
      }, { size: 0 }, {
        formSchema: fixtures.formSchema,
        detailed: true,
        aggregations: [{
          key: 'checkboxWithoutOption',
          field: 'no-option',
          type: 'additionalFields',
          missing: 'N/A',
        }],
      });

      expect(aggregations).toEqual({
        checkboxWithoutOption: [
          {
            eventCount: 3,
            key: 'N/A',
          },
        ],
      });
    },
  );

  it('includeFields works on standard and additional fields', async () => {
    const { events: [event] } = await service('additional').search({
      state: null,
      uid: 1,
    }, {}, {
      formSchema: fixtures.formSchema,
      includeFields: ['uid', 'categories-agenda-metropolitain'],
    });

    expect(Object.keys(event)).toEqual(['uid', 'categories-agenda-metropolitain']);
  });

  it('includeFields works on sub-fields', async () => {
    const { events: [event] } = await service('additional').search({
      state: null,
      uid: 3,
    }, {}, {
      includeFields: ['uid', 'location.city'],
    });

    expect(event).toEqual({
      uid: 3,
      location: {
        city: 'Rue',
      },
    });
  });
});
