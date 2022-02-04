'use strict';

const convertLegacyFilter = require('../index');
const lilleTagSet = require('./fixtures/lilleTagSet.json');
const lilleFormSchema = require('./fixtures/lilleFormSchema.json');
const bordeauxTagSet = require('./fixtures/bordeauxTagSet.json');
const bordeauxFormSchema = require('./fixtures/bordeauxFormSchema.json');
const bordeauxCategorySet = require('./fixtures/bordeauxCategorySet.json');

describe('convert legacy filters', () => {
  test('convert date', () => {
    const oaq = {
      from: '2021-09-20',
      to: '2021-09-20'
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ timings: { gte: '2021-09-19T00:00:00.0000Z', lte: '2021-09-20T23:59:59.9990Z' } });
  });

  test('convert search', () => {
    const oaq = {
      what: 'concert'
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ search: 'concert', relative: ['current', 'upcoming'] });
  });

  test('convert passed', () => {
    const oaq = {
      passed: '1'
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ });
  });

  test('convert location', () => {
    const oaq = {
      location: 65918542
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ locationUid: 65918542, relative: ['current', 'upcoming'] });
  });

  test('convert slug', () => {
    const oaq = {
      slug: 'mon-événement'
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ slug: 'mon-événement' });
  });

  test('convert district', () => {
    const oaq = {
      scope: 'district',
      what: 'centre'
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ district: 'centre', relative: ['current', 'upcoming'] });
  });

  test('convert lille tags', () => {
    const oaq = {
      tags: 'spectacle'
    };

    expect(convertLegacyFilter(oaq, {
      formSchema: lilleFormSchema,
      tagSet: lilleTagSet
    })).toStrictEqual({ 'categories-metropolitaines': 20, relative: ['current', 'upcoming'] });
  });

  test('convert lille tag filter', () => {
    const oaq = {
      tags: ['spectacle']
    };

    expect(convertLegacyFilter(oaq, { formSchema: lilleFormSchema, tagSet: lilleTagSet })).toStrictEqual({ 'categories-metropolitaines': 20, relative: ['current', 'upcoming'] });
  });

  test('convert bordeaux tags', () => {
    const oaq = {
      tags: 'administration'
    };

    expect(convertLegacyFilter(oaq, {
      formSchema: bordeauxFormSchema,
      tagSet: bordeauxTagSet
    })).toStrictEqual({ 'thematiques-bordeaux-metropole': 3, relative: ['current', 'upcoming'] });
  });

  test('convert category', () => {
    const oaq = {
      category: 'concert'
    };

    expect(convertLegacyFilter(oaq, {
      formSchema: bordeauxFormSchema,
      categorySet: bordeauxCategorySet
    })).toStrictEqual({ 'categories-agenda-metropolitain': 46, relative: ['current', 'upcoming'] });
  });

  test('convert multiple filters', () => {
    const oaq = {
      tags: 'spectacle',
      location: 65918542,
      passed: '1',
      from: '2021-09-20',
      to: '2021-09-20'
    };

    expect(convertLegacyFilter(oaq, { formSchema: lilleFormSchema, tagSet: lilleTagSet })).toStrictEqual({
      'categories-metropolitaines': 20,
      locationUid: 65918542,
      timings: { gte: '2021-09-19T00:00:00.0000Z', lte: '2021-09-20T23:59:59.9990Z' }
    });
  });
});
