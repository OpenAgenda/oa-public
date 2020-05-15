'use strict';

const applyTimezone = require('../lib/timings/applyTimezone');
const getJSONDuration = require('../lib/timings/getJSONDuration');
const getLabels = require('../lib/timings/getLabels');

describe('12 - timing helper functions', () => {
  it('applyTimezone provides timing start and end in specified timezone', () => {
    expect(
      applyTimezone(
        {
          start: '2019-06-30T10:00:00Z',
          end: '2019-06-30T12:00:00Z'
        },
        'Europe/Paris'
      )
    ).toEqual({
      start: '2019-06-30T12:00:00+02:00',
      end: '2019-06-30T14:00:00+02:00'
    });
  });

  it('getJSONDuration returns duration of timing', () => {
    expect(
      getJSONDuration('2019-06-30T10:00:00Z', '2019-06-30T12:00:00Z')
    ).toBe('PT2H');
  });

  it('getLabels provides labels for timings in the moment lib locale', () => {
    expect(
      getLabels(
        {
          start: '2019-06-30T10:00:00Z',
          end: '2019-06-30T12:00:00Z'
        },
        'Europe/Paris',
        'fr'
      )
    ).toEqual({
      start: { day: 'dimanche 30', time: '12:00' },
      end: { day: 'dimanche 30', time: '14:00' }
    });

    expect(
      getLabels(
        {
          start: '2019-06-30T10:00:00Z',
          end: '2019-06-30T12:00:00Z'
        },
        'Europe/Paris',
        'en'
      )
    ).toEqual({
      start: { day: 'Sunday 30', time: '12:00 PM' },
      end: { day: 'Sunday 30', time: '2:00 PM' }
    });
  });
});
