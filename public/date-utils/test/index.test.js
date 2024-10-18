import dateFnsLocale from 'date-fns/locale/fr';
import spreadTimings from '../src/spreadTimings';

describe('spreadTimings', () => {
  const timezone = 'Europe/Paris';

  it('correctly distributes timings across different months, weeks, and days', () => {
    const timings = [
      { begin: '2024-08-01T12:00:00Z', end: '2024-08-01T13:00:00Z' },
      { begin: '2024-08-15T12:00:00Z', end: '2024-08-15T13:00:00Z' },
      { begin: '2024-09-02T12:00:00Z', end: '2024-09-02T13:00:00Z' },
    ];

    const result = spreadTimings(timings, timezone);

    expect(result).toEqual({
      '2024-08': {
        1: {
          '2024-08-01': [
            { begin: '2024-08-01T12:00:00Z', end: '2024-08-01T13:00:00Z' },
          ],
        },
        3: {
          '2024-08-15': [
            { begin: '2024-08-15T12:00:00Z', end: '2024-08-15T13:00:00Z' },
          ],
        },
      },
      '2024-09': {
        1: {
          '2024-09-02': [
            { begin: '2024-09-02T12:00:00Z', end: '2024-09-02T13:00:00Z' },
          ],
        },
      },
    });
  });

  it('handles multiple events occurring on the same day', () => {
    const timings = [
      { begin: '2024-08-01T12:00:00Z', end: '2024-08-01T13:00:00Z' },
      { begin: '2024-08-01T14:00:00Z', end: '2024-08-01T15:00:00Z' },
    ];

    const result = spreadTimings(timings, timezone);

    expect(result).toEqual({
      '2024-08': {
        1: {
          '2024-08-01': [
            { begin: '2024-08-01T12:00:00Z', end: '2024-08-01T13:00:00Z' },
            { begin: '2024-08-01T14:00:00Z', end: '2024-08-01T15:00:00Z' },
          ],
        },
      },
    });
  });

  it('handles timings across different weeks', () => {
    const timings = [
      { begin: '2024-08-31T12:00:00Z', end: '2024-08-31T13:00:00Z' },
      { begin: '2024-09-01T12:00:00Z', end: '2024-09-01T13:00:00Z' },
    ];

    const result = spreadTimings(timings, timezone);

    expect(result).toEqual({
      '2024-08': {
        5: {
          '2024-08-31': [
            { begin: '2024-08-31T12:00:00Z', end: '2024-08-31T13:00:00Z' },
          ],
        },
      },
      '2024-09': {
        1: {
          '2024-09-01': [
            { begin: '2024-09-01T12:00:00Z', end: '2024-09-01T13:00:00Z' },
          ],
        },
      },
    });
  });

  it('handles correctly start of weeks', () => {
    const timings = [
      { begin: '2024-10-13T00:15:00+02:00', end: '2024-10-13T00:15:00+02:00' },
      { begin: '2024-10-14T00:15:00+02:00', end: '2024-10-14T00:15:00+02:00' },
    ];

    const result = spreadTimings(timings, timezone, { locale: dateFnsLocale });

    expect(result).toEqual({
      '2024-10': {
        2: {
          '2024-10-13': [
            {
              begin: '2024-10-13T00:15:00+02:00',
              end: '2024-10-13T00:15:00+02:00',
            },
          ],
        },
        3: {
          '2024-10-14': [
            {
              begin: '2024-10-14T00:15:00+02:00',
              end: '2024-10-14T00:15:00+02:00',
            },
          ],
        },
      },
    });
  });

  it('returns an empty object when there are no timings', () => {
    const result = spreadTimings([], timezone);

    expect(result).toEqual({});
  });
});
