'use strict';

const fs = require('fs');
const _ = require('lodash');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: timings sorting', () => {
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

  beforeAll(() => service('timings').rebuild({
    eventsList: async (_lastId, _limit) => JSON.parse(fs.readFileSync(`${__dirname}/fixtures/02_events.timings.json`)),
  }));

  it(
    'by default sorts from the nearest to the furthest in the future',
    async () => {
      const { events } = await service('timings').search({});

      expect(
        events.map(e => e.title.fr),
      ).toEqual(
        ['Tic', 'Tac', 'Rangers du risque'],
      );
    },
  );

  it(
    'filtered on specific upcoming period focuses search on the filtered period',
    async () => {
      const { events } = await service('timings').search({
        timings: {
          gte: new Date('2030-01-02T00:00:00+0200'),
        },
      });

      expect(
        events.map(e => e.title.fr),
      ).toEqual(
        ['Rangers du risque', 'Tac', 'Tic'],
      );
    },
  );

  it(
    'sorts using begin of timing, filters out on accessible_until (end)',
    async () => {
      const { events } = await service('timings').search({
        state: 1,
        timings: {
          gte: new Date('2042-06-11T00:00:00+0200'),
        },
      });

      expect(
        events.map(e => e.title.fr),
      ).toEqual(
        ['Visite guidée le Vieux Lille', 'Mon dodo'],
      );
    },
  );

  const extract = (event, fields) => fields.reduce((carry, field) => _.set(carry, field, _.get(event, field)), {});

  it('lastTiming lists past after upcoming', async () => {
    const {
      after,
      events,
    } = await service('timings').search({
      state: null,
      keyword: 'pau',
      sort: 'lastTiming.asc',
    }, { size: 2 }, { useAfterKey: true });

    expect(
      events.map(e => extract(e, ['title', 'lastTiming.begin'])),
    ).toEqual([
      {
        title: { fr: 'Mon dodo' },
        lastTiming: { begin: '2042-06-11T16:15:00+02:00' },
      },
      {
        title: { fr: 'Nouveau siècle' },
        lastTiming: { begin: '2001-01-01T00:00:00+01:00' },
      },
    ]);

    const next = await service('timings').search({
      state: null,
      keyword: 'pau',
      sort: 'lastTiming.asc',
    }, { size: 2, after }, { useAfterKey: true });

    expect(
      next.events.map(e => extract(e, ['title', 'lastTiming.begin'])),
    ).toEqual([
      {
        title: {
          fr: 'Mort de Bourvil',
        },
        lastTiming: {
          begin: '1970-09-23T14:45:00+02:00',
        },
      },
    ]);
  });

  it('sort using lastTiming', async () => {
    const { events } = await service('timings').search({
      state: null,
      keyword: 'ltwf', // limit test to upcoming events
      sort: 'lastTiming.asc',
    });

    expect(
      events.map(e => `${e.uid}: ${e.lastTiming.begin}`),
    ).toEqual([
      '3: 2030-01-02T09:00:00+0200',
      '2: 2030-01-02T11:00:00+0200',
      '1: 2030-01-02T12:00:00+0200',
      '4: 2042-06-11T14:00:00+02:00',
      '5: 2042-06-11T16:15:00+02:00',
    ]);
  });

  it('sort using lastTimingWithFeatured', async () => {
    const { events } = await service('timings').search({
      state: null,
      keyword: 'ltwf', // limit test to upcoming events
      sort: 'lastTimingWithFeatured.asc',
    });

    const { isSorted: sorted } = events.reduce(({ isSorted, previous }, event) => {
      if (!isSorted) {
        return { isSorted };
      }

      return {
        isSorted: previous ? event.lastTiming.begin > previous.lastTiming.begin : true,
        previous: event,
      };
    }, {
      isSorted: true,
      previous: null,
    });

    expect(sorted).toBeTruthy();
  });
});
