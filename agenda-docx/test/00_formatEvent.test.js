const fs = require('node:fs');
const _ = require('lodash');

const formatEvent = require('../server/lib/formatEvent');

const inputEvent = JSON.parse(
  fs.readFileSync(`${__dirname}/data/event.json`, 'utf-8'),
);
const decoratedEvent = JSON.parse(
  fs.readFileSync(`${__dirname}/data/event.decorated.json`, 'utf-8'),
);

describe('unit - formatEvent', () => {
  let formatted;

  beforeAll(() => {
    formatted = formatEvent(inputEvent, { lang: 'fr' });
  });

  test('flatten and decorate event to get it ready for docx', () => {
    expect(_.omit(formatted, 'diffWithNow')).toEqual(
      _.omit(decoratedEvent, 'diffWithNow'),
    );
  });

  test('Non-XML-compatible character is cleaned up', () => {
    expect(formatted.conditions.charCodeAt(2)).toBe(32);
  });
});
