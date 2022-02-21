'use strict';

const decorateWithCounts = require('../lib/decorateWithCounts');
const geoFields = require('../utils/geoFields');

describe('utils', () => {
  describe('geoFields', () => {
    it('has specific labels for Switzerland', () => {
      expect(geoFields('CH', 'adminLevel1')).toBe('adminLevel1_CH');
    });

    it('does not have specific labels for the UAE', () => {
      expect(geoFields('AE', 'adminLevel1')).toBe('adminLevel1');
    });

    it('does not have specific labels for the JA', () => {
      expect(geoFields('JA', 'adminLevel1')).toBe('adminLevel1');
    });
  });

  describe('decorateWithCounts', () => {
    it('adds given counts to matching location', () => {
      const locations = [
        {
          uid: 111,
          name: 'Le Monop',
        },
        {
          uid: 112,
          name: 'Le Prisu',
        },
      ];

      decorateWithCounts(locations, [
        {
          uid: 112,
          agendaEventCount: 12,
          eventCount: 24,
        },
      ]);

      expect(locations).toStrictEqual([
        {
          uid: 111,
          name: 'Le Monop',
          eventCount: 0,
          agendaEventCount: 0,
        },
        {
          uid: 112,
          name: 'Le Prisu',
          agendaEventCount: 12,
          eventCount: 24,
        },
      ]);
    });
  });
});
