import fs from 'node:fs';
import moment from 'moment-timezone';
import * as ics from '../lib/ics/index.js';
import event from './fixtures/acces-libre.json' with { type: 'json' };
import foireAuxLivres from './fixtures/foire-aux-livres.json' with { type: 'json' };

const ICSHead = fs.readFileSync(
  `${import.meta.dirname}/fixtures/head.ics`,
  'utf-8',
);
const ICSEvent = fs.readFileSync(
  `${import.meta.dirname}/fixtures/event.ics`,
  'utf-8',
);

describe('flat-exports - unit - ics', () => {
  describe('helpers', () => {
    test('ics head', () => {
      expect(
        ics.head({
          slug: 'la-gargouille',
          identifier: 123,
          type: 'agenda',
          lang: 'fr',
          title: 'La Gargouille',
          description: 'Evénements à Paris',
        }),
      ).toEqual(ICSHead);
    });

    test('ics event', () => {
      const result = ics.parseEvent({ lang: 'fr' }, event);

      expect(result).toEqual(
        ICSEvent.replace('{DTSTAMP}', moment.tz().format('YYYYMMDDTHHmm00[Z]')),
      );
    });

    test('multiple timings show as multiple events', () => {
      const lines = ics
        .parseEvent({ lang: 'fr' }, foireAuxLivres)
        .split('\r\n');

      expect(lines.filter((l) => l === 'BEGIN:VEVENT').length).toBe(2);
      expect(lines.filter((l) => l === 'END:VEVENT').length).toBe(2);
    });
  });
});
