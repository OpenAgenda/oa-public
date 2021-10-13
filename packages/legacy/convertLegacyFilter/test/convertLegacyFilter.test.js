'use strict';

const convertLegacyFilter = require('../index');
const tagSet = require('./fixtures/tagSet.json');
const schema = require('./fixtures/formSchema.json');

describe('convert legacy filters', () => {
  test('convert date', () => {
    const oaq = {
      from: '2021-09-20',
      to: '2021-09-28'
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ timings: { gte: '2021-09-20T00:00:00.0000Z', lte: '2021-09-28T00:00:00.0000Z' } });
  });

  test('convert search', () => {
    const oaq = {
      what: 'concert'
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ search: 'concert' });
  });

  test('convert passed', () => {
    const oaq = {
      passed: 1
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({});
  });

  test('convert location', () => {
    const oaq = {
      location: 65918542
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ locationUid: 65918542 });
  });

  test('convert tags', () => {
    const oaq = {
      tags: 'concert'
    };

    expect(convertLegacyFilter(oaq, schema, tagSet)).toStrictEqual({ 'type-devenement': 38 });
  });

  test('convert multiple filters', () => {
    const oaq = {
      tags: 'concert',
      location: 65918542,
      from: '2021-09-20',
      to: '2021-09-28'
    };

    expect(convertLegacyFilter(oaq, schema, tagSet)).toStrictEqual({
      'type-devenement': 38,
      locationUid: 65918542,
      timings: { gte: '2021-09-20T00:00:00.0000Z', lte: '2021-09-28T00:00:00.0000Z' }
    });
  });
});
