'use strict';

const getMonthWeek = require('../lib/events/getMonthWeek');

describe('11 - getMonthWeek', () => {
  it('returns week of month', () => {
    expect(getMonthWeek(new Date('2018-12-01T10:00:00Z'), 'Europe/Paris')).toBe(
      1
    );

    expect(getMonthWeek(new Date('2018-12-23T10:00:00Z'), 'Europe/Paris')).toBe(
      4
    );
  });
});
