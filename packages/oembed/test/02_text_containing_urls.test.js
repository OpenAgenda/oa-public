'use strict';

const fs = require('fs');
const _ = require('lodash');

const OEmbed = require('..');
const options = require('../testconfig');

const IFRAMELY_OBJECT_KEYS = [
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
  'cache_age',
  'options'
];

const texts = {
  raffut: fs.readFileSync(`${__dirname}/fixtures/forroraffut.md`, 'utf-8'),
  contrebrassens: fs.readFileSync(`${__dirname}/fixtures/contrebrassens.txt`, 'utf-8')
};

describe('parsing links from markdown', () => {
  const oe = new OEmbed(options);

  test('finds links in markdown and returns list of links with oembeds', async () => {
    const result = await oe.fromMarkdown(texts.raffut);

    expect(_.get(result, '0.data.provider_name')).toEqual('YouTube');
    expect(result.length).toBe(1);
    expect(_.keys(result[0].data)).toEqual(IFRAMELY_OBJECT_KEYS);
  });

  test('multiple links in the same text are all processed', async () => {
    const result = await oe.fromMarkdown(texts.contrebrassens);

    expect(result.map(r => _.get(r, 'data.title')).sort()).toEqual([
      'CONTREBRASSENS',
      'L\'improbable duo : Contrebrassens & Michael Wookey /// teaser 2016'
    ]);
  });

  test('data that are already in hand can be passed to the function to avoid an unnecessary re-fetch', async () => {
    const result = await oe.fromMarkdown(texts.contrebrassens, {
      current: [{
        link: 'https://vimeo.com/258230134',
        data: { title: 'This is in hand' }
      }]
    });

    expect(result.map(r => _.get(r, 'data.title')).sort()).toEqual([
      'L\'improbable duo : Contrebrassens & Michael Wookey /// teaser 2016',
      'This is in hand'
    ]);
  });

  test('finds links in markdown and returns list of links with and without oembeds', async () => {
    const result = await oe.fromMarkdown(texts.raffut, { includeEmbedlessLinks: true });

    expect(_.get(result, '0.data.provider_name')).toEqual('YouTube');
    expect(result[1].link).toEqual('https://www.facebook.com/forroraffut/');
  });

  test('filters out invalid links', async () => {
    // break a link
    const invalidRaffut = texts.raffut.replace('www.facebook.com', 'wwwfacebookcom');

    const result = await oe.fromMarkdown(invalidRaffut, {
      includeEmbedlessLinks: true,
      filterInvalidLinks: true
    });

    expect(result.length).toBe(1);
    expect(result[0].link.indexOf('youtube') !== -1).toBeTruthy();
  });

  test('keep no embedable links', async () => {
    const result = await oe.fromMarkdown('http://jacbac.github.io/bibliotech/posts/2013/post-install-linux-distrib/', {
      includeEmbedlessLinks: true,
      filterInvalidLinks: true
    });

    expect(result.length).toBe(1);
    expect(result[0].data).toBeUndefined();
  });
});
