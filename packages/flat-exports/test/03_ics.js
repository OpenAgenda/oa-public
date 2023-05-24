'use strict';

const fs = require('fs');
const moment = require('moment-timezone');

const ics = require('../lib/ics');
const event = require('./fixtures/acces-libre.json');

const ICSHead = fs.readFileSync(`${__dirname}/fixtures/head.ics`, 'utf-8');
const ICSEvent = fs.readFileSync(`${__dirname}/fixtures/event.ics`, 'utf-8');

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
          description: 'Evénements à Paris'
        })
      ).toEqual(ICSHead);
    });

    test('ics event', () => {
      const result = ics.parseEvent({ lang: 'fr' }, event);

      expect(result).toEqual(
        ICSEvent.replace('{DTSTAMP}', moment.tz().format('YYYYMMDDTHHmm00[Z]'))
      );
    });
  });
});
