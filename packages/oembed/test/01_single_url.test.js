'use strict';

const OEmbed = require('../');
const options = require('../testconfig');

const urls = {
  calameo: [
    'http://fr.calameo.com/read/00096250654676c5c42f2'
  ],
  noEmbed: [
    'http://jacbac.github.io/bibliotech/posts/2013/post-install-linux-distrib/'
  ],
  wemap: [
    'https://livemap.getwemap.com/embed.html?emmid=14234&token=K9UCJCEUJ3ZEJ1E3QXTA94YKO#/search@50.6851478,3.1661224,11.00'
  ],
};

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

  test('gets no-embedable link', async () => {
    const result = await oe.get(urls.noEmbed[0]);

    expect(result).toEqual(null);
  });


  test('lazy option', async () => {
    const result = await oe.get(urls.wemap[0], { lazy: true });

    expect(result.html).toEqual('<div><div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 65.5137%; padding-top: 120px;"><iframe data-iframely-url="https://cdn.iframe.ly/api/iframe?app=1&amp;url=https%3A%2F%2Flivemap.getwemap.com%2Fembed.html%3Femmid%3D14234%26token%3DK9UCJCEUJ3ZEJ1E3QXTA94YKO%23%2Fsearch%4050.6851478%2C3.1661224%2C11.00&amp;key=7db9d78bdbb5e7d79acb1240cae64b0e" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen=""></iframe></div></div>');

    expect(result.script).toEqual({ async: true, charset: 'utf-8', src: 'https://cdn.iframe.ly/embed.js' });
  });
});
