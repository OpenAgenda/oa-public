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
      to: '2021-09-20',
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({
      timings: {
        gte: '2021-09-19T00:00:00+02:00',
        lte: '2021-09-20T23:59:59+02:00',
      },
    });
  });

  test('convert search', () => {
    const oaq = {
      what: 'concert',
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ search: 'concert', relative: ['current', 'upcoming'] });
  });

  test('when passed is set to 1 in legacy, no filter is defined in converted object', () => {
    const oaq = {
      passed: '1',
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ });
  });

  test('when passed is set to 0 in legacy, filter should be relative set with current and upcoming', () => {
    expect(
      convertLegacyFilter({ passed: '0' }),
    ).toEqual({
      relative: ['current', 'upcoming'],
    });
  });

  test('when passed is not set in legacy, filter should be relative set with current and upcoming', () => {
    expect(
      convertLegacyFilter({}),
    ).toEqual({
      relative: ['current', 'upcoming'],
    });
  });

  test('convert location', () => {
    const oaq = {
      location: 65918542,
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ locationUid: 65918542, relative: ['current', 'upcoming'] });
  });

  test('convert slug', () => {
    const oaq = {
      slug: 'mon-événement',
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ slug: 'mon-événement' });
  });

  test('convert district', () => {
    const oaq = {
      scope: 'district',
      what: 'centre',
    };

    expect(convertLegacyFilter(oaq)).toStrictEqual({ district: 'centre', relative: ['current', 'upcoming'] });
  });

  test('convert lille tag filter', () => {
    const oaq = {
      tags: ['spectacle'],
    };

    expect(convertLegacyFilter(oaq, { formSchema: lilleFormSchema, tagSet: lilleTagSet })).toStrictEqual({ 'categories-metropolitaines': [20], relative: ['current', 'upcoming'] });
  });

  test('convert bordeaux tags', () => {
    const oaq = {
      tags: ['administration'],
    };

    expect(convertLegacyFilter(oaq, {
      formSchema: bordeauxFormSchema,
      tagSet: bordeauxTagSet,
    })).toStrictEqual({ 'thematiques-bordeaux-metropole': [3], relative: ['current', 'upcoming'] });
  });

  test('convert category', () => {
    const oaq = {
      category: ['concert', 'atelier'],
    };

    expect(convertLegacyFilter(oaq, {
      formSchema: bordeauxFormSchema,
      categorySet: bordeauxCategorySet,
    })).toStrictEqual({ 'categories-agenda-metropolitain': [43, 46], relative: ['current', 'upcoming'] });
  });

  test('convert featured', () => {
    const oaq = {
      featured: 1,
    };

    expect(convertLegacyFilter(oaq, {})).toStrictEqual({ featured: 1, relative: ['current', 'upcoming'] });
  });

  test('convert multiple filters', () => {
    const oaq = {
      tags: ['spectacle', 'concert', 'culture'],
      location: 65918542,
      passed: '1',
      from: '2021-09-20',
      to: '2021-09-20',
    };

    expect(convertLegacyFilter(oaq, { formSchema: bordeauxFormSchema, tagSet: bordeauxTagSet })).toStrictEqual({
      'categories-agenda-metropolitain': [46, 59],
      'thematiques-bordeaux-metropole': [9],
      locationUid: 65918542,
      timings: {
        gte: '2021-09-19T00:00:00+02:00',
        lte: '2021-09-20T23:59:59+02:00',
      },
    });
  });

  test('relative is not forced when time filters are already set in general query', () => {
    const converted = convertLegacyFilter({}, {
      query: { timings: { gte: new Date(), lte: new Date() } },
    });

    expect(converted.relative).toBeUndefined();
  });

  test('relative is forced when no time filters are already set in general query', () => {
    const converted = convertLegacyFilter({}, {
      query: {},
    });

    expect(converted.relative).toEqual(['current', 'upcoming']);
  });
});
