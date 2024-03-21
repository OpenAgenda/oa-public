"use strict";

const new_patterns = require('../patterns');

describe('partterns', () => {
  it('no timings return empty string', () => {
    expect(new_patterns([], 'en')).toBe('');
  });
  it('different weekdays return empty string', () => {
    expect(new_patterns([
      {
        start: new Date('2015-12-01T07:00:00Z'),
        end: new Date('2015-12-01T08:00:00Z')
      },
      {
        start: new Date('2015-12-06T10:00:00Z'),
        end: new Date('2015-12-06T10:30:00Z')
      },
    ], 'en')).toBe('');
  });
  it('different timing at same date still count as one date', () => {
    expect(new_patterns([
      {
        start: new Date('2015-12-01T07:00:00Z'),
        end: new Date('2015-12-01T08:00:00Z')
      },
      {
        start: new Date('2015-12-01T10:00:00Z'),
        end: new Date('2015-12-01T10:30:00Z')
      },
      {
        start: new Date('2015-12-08T07:00:00Z'),
        end: new Date('2015-12-08T08:00:00Z')
      },
      {
        start: new Date('2015-12-08T10:00:00Z'),
        end: new Date('2015-12-08T10:30:00Z')
      },
    ], 'fr')).toBe(', tous les mardis');
  });

  it('certains mardis', () => {
    expect(new_patterns([
      {
        start: new Date('2015-12-01T07:00:00Z'),
        end: new Date('2015-12-01T08:00:00Z')
      },
      {
        start: new Date('2015-12-15T07:00:00Z'),
        end: new Date('2015-12-15T08:00:00Z')
      }
    ], 'fr')).toBe(', certains mardis');
  });
  it('tous les mardis', () => {
    expect(new_patterns([
      {
        start: new Date('2015-12-01T07:00:00Z'),
        end: new Date('2015-12-01T08:00:00Z')
      },
      {
        start: new Date('2015-12-08T07:00:00Z'),
        end: new Date('2015-12-08T08:00:00Z')
      }
    ], 'fr')).toBe(', tous les mardis');
  });
});