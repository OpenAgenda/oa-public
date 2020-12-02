'use strict';

const fs = require('fs');
const _ = require('lodash');

const spreadPerMonth = require('../lib/events/spreadPerMonthPerDay');

describe('10 - spreadPerMonthPerDay', () => {
  describe('basics', () => {
    let months;

    beforeAll(() => {
      months = spreadPerMonth(
        [
          {
            start: new Date('2018-12-01T00:00:00+0100'),
            end: new Date('2018-12-01T01:00:00+0100')
          }
        ],
        'Europe/Paris',
        'fr'
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
        start: new Date('2018-10-10T10:00:00+0200'),
        end: new Date('2018-10-10T11:00:00+0200')
      },
      {
        start: new Date('2018-11-15T10:00:00+0200'),
        end: new Date('2018-11-15T15:00:00+0200')
      },
      {
        start: new Date('2018-12-01T00:00:00+0100'),
        end: new Date('2018-12-01T01:00:00+0100')
      }
    ];

    const spreadTimings = fs
      .readFileSync(`${__dirname}/fixtures/spreadTimings.json`, 'utf-8')
      .trim('\n');
    const spreadTimingsNYC = fs
      .readFileSync(`${__dirname}/fixtures/spreadTimings.nyc.json`, 'utf-8')
      .trim('\n');

    it('Timings are distributed in an array of months and sub-array of days', () => {
      const result = spreadPerMonth(timings, 'Europe/Paris', 'fr');

      expect(
        JSON.stringify(
          result.map(m => _.omit(m, 'diff')),
          null,
          2
        )
      ).toBe(spreadTimings);
    });

    it('When december hits Paris, it is still november in New York', () => {
      const result = spreadPerMonth(timings, 'America/New_York', 'en');

      expect(
        JSON.stringify(
          result.map(m => _.omit(m, 'diff')),
          null,
          2
        )
      ).toBe(spreadTimingsNYC);
    });
  });
});
