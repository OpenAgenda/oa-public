const fs = require('fs');
const _ = require('lodash');

const formatEvent = require('../server/lib/formatEvent');

const inputEvent = JSON.parse(
  fs.readFileSync(`${__dirname}/data/event.json`, 'utf-8')
);
const decoratedEvent = JSON.parse(
  fs.readFileSync(`${__dirname}/data/event.decorated.json`, 'utf-8')
);

describe('unit - formatEvent', () => {
  test('flatten and decorate event to get it ready for docx', () => {
    expect(
      _.omit(formatEvent(inputEvent, { lang: 'fr' }), 'diffWithNow')
    ).toEqual(_.omit(decoratedEvent, 'diffWithNow'));
  });
});
