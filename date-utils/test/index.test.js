import SpreadTimings from '../src/components/SpreadTimings';

describe('SpreadTimings', () => {
  const timezone = 'Europe/Paris';

  it('correctly distributes timings across different months, weeks, and days', () => {
    const timings = [
      { begin: '2024-08-01T12:00:00Z', end: '2024-08-01T13:00:00Z' },
      { begin: '2024-08-15T12:00:00Z', end: '2024-08-15T13:00:00Z' },
      { begin: '2024-09-02T12:00:00Z', end: '2024-09-02T13:00:00Z' },
    ];

    const result = SpreadTimings(timings, timezone);

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

    const result = SpreadTimings(timings, timezone);

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

    const result = SpreadTimings(timings, timezone);

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

  it('returns an empty object when there are no timings', () => {
    const result = SpreadTimings([], timezone);

    expect(result).toEqual({});
  });
});
