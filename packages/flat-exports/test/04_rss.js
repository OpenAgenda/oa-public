'use strict';

const formatEvent = require('../lib/rss/formatEvent');
const rss = require('../rss');
const event = JSON.parse(require('node:fs').readFileSync(`${__dirname}/fixtures/sortir-a-boulogne-billancourt.json`, 'utf-8'));

describe('flat-exports - unit - rss', () => {
  test('formatEvent', () => {
    expect(
      formatEvent(event).custom_elements,
    ).toEqual([
      { 'ev:startdate': '2017-03-08T09:30:00' },
      { 'ev:enddate': '2017-12-21T18:00:00' },
      { 'ev:location': 'Centre national du Jeu - 17, allée Robert Doisneau, 92100 Boulogne-Billancourt' },
    ]);
  });

  test('formatEvent - custom genUrl', () => {
    expect(
      formatEvent(event, { genUrl: e => `grut${e.uid}` }).url,
    ).toEqual(`grut${event.uid}`);
  });
});

describe('flat-exports - functional - rss', () => {
  let xml;

  beforeAll(() => {
    const feed = rss({
      title: 'Un agenda',
      description: 'Un agenda de test',
      feedURL: 'https://openagenda.com',
      siteURL: 'https://openagenda.com',
      language: 'fr',
    });

    feed.addEvent(event);

    xml = feed.xml();
  });

  it('rss head should contain xmlns:ev reference', () => {
    expect(
      xml.indexOf('xmlns:ev'),
    ).not.toBe(-1);
  });

  it('links in enclosures should be http', () => {
    expect(
      xml.indexOf('enclosure url="https'),
    ).toBe(-1);

    expect(
      xml.indexOf('enclosure url="http'),
    ).not.toBe(-1);
  });
});
