'use strict';

const OEmbed = require('../');

const urls = {
  calameo: [
    'http://fr.calameo.com/read/00096250654676c5c42f2'
  ]
};

const options = {
  iframely: {
    key: process.env.IFRAMELY_KEY
  },
  filters: [
    "youtube",
    "dailymotion",
    "/day\.ly/",
    "vimeo",
    "soundcloud",
    "twitter\.com\/.+\/status\/[0-9]+$",
    "flickr",
    "instagram",
    "tumblr",
    "prezi",
    "google",
    "ted",
    "ina\.fr",
    "youtu",
    "calameo",
    "allocine",
  ]
}

describe('parsing urls', () => {
  const oe = new OEmbed(options);

  test('gets calameo', async () => {
    const result = await oe.get(urls.calameo[0]);

    expect(Object.keys(result)).toEqual( [
      'url',
      'type',
      'version',
      'title',
      'author',
      'author_url',
      'provider_name',
      'description',
      'thumbnail_url',
      'thumbnail_width',
      'thumbnail_height',
      'html',
      'cache_age'
    ]);
  });

});
