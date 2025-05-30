import applyTimezone from '../lib/timings/applyTimezone.js';
import getLabels from '../lib/timings/getLabels.js';

describe('12 - timing helper functions', () => {
  it('applyTimezone provides timing start and end in specified timezone', () => {
    expect(
      applyTimezone(
        {
          start: '2019-06-30T10:00:00Z',
          end: '2019-06-30T12:00:00Z',
        },
        'Europe/Paris',
      ),
    ).toEqual({
      start: '2019-06-30T12:00:00+02:00',
      end: '2019-06-30T14:00:00+02:00',
    });
  });

  it('getLabels provides labels for timings in the moment lib locale', () => {
    expect(
      getLabels(
        {
          start: '2019-06-30T10:00:00Z',
          end: '2019-06-30T12:00:00Z',
        },
        'Europe/Paris',
        'fr',
      ),
    ).toEqual({
      start: { day: 'dimanche 30', time: '12:00' },
      end: { day: 'dimanche 30', time: '14:00' },
    });

    expect(
      getLabels(
        {
          start: '2019-06-30T10:00:00Z',
          end: '2019-06-30T12:00:00Z',
        },
        'Europe/Paris',
        'en',
      ),
    ).toEqual({
      start: { day: 'Sunday 30', time: '12:00 PM' },
      end: { day: 'Sunday 30', time: '2:00 PM' },
    });
  });
});
