'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: relative filter', () => {
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
    const fixtures = JSON.parse(
      fs.readFileSync(`${__dirname}/fixtures/02_events.relative.json`),
    );
    const anHourAgo = new Date();
    anHourAgo.setHours(anHourAgo.getHours() - 1);

    const inAnHour = new Date();
    inAnHour.setHours(inAnHour.getHours() + 1);

    // last event occurs today, started an hour ago and will finish in an hour
    fixtures.events[fixtures.events.length - 1].timings = [{
      begin: JSON.stringify(anHourAgo).replace(/"/g, ''),
      end: JSON.stringify(inAnHour).replace(/"/g, ''),
    }];

    await service('relative').rebuild({
      eventsList: async (_lastId, _limit) => fixtures,
    });
  });

  it('relative filter set to passed only returns passed events', async () => {
    const { events, total } = await service('relative').search({
      relative: 'passed',
    });

    expect(total).toBe(1);
    expect(events[0].title.fr).toBe('Marignan');
  });

  it('relative filter set to upcoming returns upcoming events', async () => {
    const { events, total } = await service('relative').search({
      relative: 'upcoming',
    });

    expect(total).toBe(1);
    expect(events[0].title.fr).toBe('Amarsissage de Musk');
  });

  it(
    'relative filter set to current returns events with both passed and upcoming timings',
    async () => {
      const { events, total } = await service('relative').search({
        relative: 'current',
      });

      expect(total).toBe(2);
      expect(events[0].title.fr).toBe('En cours et pas à venir');
    },
  );

  it(
    'filter on current and upcoming returns also current but not upcoming',
    async () => {
      const { events } = await service('relative').search({
        relative: ['current', 'upcoming'],
      });

      expect(events.map(e => e.uid).includes(4)).toBe(true);
    },
  );

  it('filter on events occurring today', async () => {
    const { events, total } = await service('relative').search({
      timings: { range: 'today', timezone: 'Europe/Paris' },
    });

    expect(total).toBe(1);
    expect(events[0].uid).toBe(4);
  });

  it('aggregation', async () => {
    const {
      aggregations,
    } = await service('relative').search({}, { size: 0 }, { aggregations: 'relative' });

    expect(
      aggregations.relative,
    ).toEqual(
      [{
        key: 'current',
        eventCount: 2,
      }, {
        key: 'passed',
        eventCount: 1,
      }, {
        key: 'upcoming',
        eventCount: 1,
      }],
    );
  });

  it(
    'relative filter set to current and upcoming returns current and upcoming',
    async () => {
      const { events } = await service('relative').search({
        relative: ['current', 'upcoming'],
      });

      expect(
        events.map(e => e.title.fr),
      ).toEqual(
        ['En cours et pas à venir', 'Eclipses lunaires', 'Amarsissage de Musk'],
      );
    },
  );

  it(
    'ongoing event appears before event with upcoming timings on a default sort',
    async () => {
      const { events } = await service('relative').search({
        relative: ['current', 'upcoming'],
      });

      expect(events[0].title.fr).toBe('En cours et pas à venir');
    },
  );

  it(
    'relative filter set to passed and current returns passed and current',
    async () => {
      const { events } = await service('relative').search({
        relative: ['current', 'passed'],
      });

      expect(
        events.map(e => e.title.fr),
      ).toEqual(
        ['Eclipses lunaires', 'Marignan'],
      );
    },
  );

  it(
    'relative filter set to passed and upcoming excludes current',
    async () => {
      const { events } = await service('relative').search({
        relative: ['passed', 'upcoming'],
      });

      expect(
        events.map(e => e.title.fr),
      ).toEqual(
        ['Amarsissage de Musk', 'Marignan'],
      );
    },
  );

  it(
    'relative filter set to passed, upcoming and current does not exclude current',
    async () => {
      const { events } = await service('relative').search({
        relative: ['passed', 'upcoming', 'current'],
      });

      expect(
        events.map(e => e.title.fr),
      ).toEqual(
        [
          'En cours et pas à venir',
          'Eclipses lunaires',
          'Amarsissage de Musk',
          'Marignan',
        ],
      );
    },
  );
});
