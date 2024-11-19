import _ from 'lodash';
import spreadPerMonth from '../lib/events/spreadPerMonthPerDay.js';
import inputTimings from './fixtures/timings.json';
import inputTimings2 from './fixtures/timings.2.json';
import spreadTimings from './fixtures/spreadTimings.json';
import spreadTimingsNYC from './fixtures/spreadTimings.nyc.json';

describe('10 - spreadPerMonthPerDay', () => {
  describe('basics', () => {
    let months;

    beforeAll(() => {
      months = spreadPerMonth(
        [
          {
            start: new Date('2018-12-01T00:00:00+0100'),
            end: new Date('2018-12-01T01:00:00+0100'),
          },
        ],
        'Europe/Paris',
        'fr',
      );
    });

    it('a given timing is placed in the corresponding month item of the list', () => {
      expect(months).toHaveLength(1);
      expect(months[0].key).toBe('2018-12');
    });

    it('a given timing is placed in a sub-array for weeks, corresponding to the week of the month', () => {
      expect(months[0].weeks).toHaveLength(1);
      expect(months[0].weeks[0].week).toBe('1');
    });
  });

  describe('complete evaluation', () => {
    const timings = [
      {
        begin: new Date('2018-10-10T10:00:00+0200'),
        end: new Date('2018-10-10T11:00:00+0200'),
      },
      {
        begin: new Date('2018-11-15T10:00:00+0200'),
        end: new Date('2018-11-15T15:00:00+0200'),
      },
      {
        begin: new Date('2018-12-01T00:00:00+0100'),
        end: new Date('2018-12-01T01:00:00+0100'),
      },
    ];

    it('Timings are distributed in an array of months and sub-array of days', () => {
      const result = spreadPerMonth(timings, 'Europe/Paris', 'fr');

      expect(
        JSON.stringify(
          result.map((m) => _.omit(m, 'diff')),
          null,
          2,
        ),
      ).toBe(JSON.stringify(spreadTimings, null, 2));
    });

    it('When december hits Paris, it is still november in New York', () => {
      const result = spreadPerMonth(timings, 'America/New_York', 'en');

      expect(
        JSON.stringify(
          result.map((m) => _.omit(m, 'diff')),
          null,
          2,
        ),
      ).toBe(JSON.stringify(spreadTimingsNYC, null, 2));
    });
  });

  describe('invalid timings', () => {
    it('null timings are filtered out', () => {
      const timings = [{ begin: null, end: null }];

      expect(spreadPerMonth(timings, 'Europe/Paris', 'fr')).toEqual([]);
    });
  });

  describe('fixes', () => {
    it('spread timings must appear sorted', () => {
      const result = spreadPerMonth(inputTimings, 'Europe/Paris', 'fr');

      expect(result[0].weeks[1].days.map((d) => d.day).join(',')).toEqual(
        '05,06,07,08,09,10,11',
      );
    });

    it('spread must not make timings disappear', () => {
      const months = spreadPerMonth(inputTimings2, 'Europe/Paris', 'fr');
      expect(months.map((m) => m.key).join(',')).toBe('2022-10,2022-11');
    });
  });
});
