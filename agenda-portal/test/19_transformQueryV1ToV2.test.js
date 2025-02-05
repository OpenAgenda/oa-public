import transformQueryV1ToV2 from '../lib/utils/transformQueryV1ToV2.js';

describe('19 - lib/utils - transformQueryV1ToV2', () => {
  test('oaq date filter is converted to timezoned lte/gte pair', () => {
    const v2Query = transformQueryV1ToV2(
      {
        from: '2020-05-17',
        to: '2020-05-22',
      },
      { timezone: 'Europe/Paris' },
    );

    expect(v2Query).toEqual({
      date: {
        gte: '2020-05-17T00:00:00+02:00',
        lte: '2020-05-22T23:59:00+02:00',
      },
    });
  });

  test('oaq featured filter is maintained', () => {
    const v2Query = transformQueryV1ToV2(
      {
        featured: 1,
      },
      { timezone: 'Europe/Paris' },
    );

    expect(v2Query).toEqual({
      featured: 1,
    });
  });

  test('oaq passed filter is converted to lte/gte date filter', () => {
    const v2Query = transformQueryV1ToV2(
      {
        passed: '1',
      },
      { timezone: 'Europe/Paris' },
    );

    expect(v2Query).toEqual({
      date: {
        lte: 'today',
        timezone: 'Europe/Paris',
      },
    });
  });

  test('oaq passed filter is not converted to lte/gte date filter when timings or relative filter is defined', () => {
    const v2Query = transformQueryV1ToV2(
      {
        passed: '1',
      },
      {
        timezone: 'Europe/Paris',
        query: {
          timings: {
            gte: '2024-02-02',
            lte: '2024-02-08',
          },
        },
      },
    );

    expect(v2Query).toEqual({});
  });

  test('oaq tags filter is converted to something', () => {
    const v2Query = transformQueryV1ToV2(
      {
        tags: ['animation'],
      },
      {
        slugSchemaOptionIdMap: [
          {
            fieldName: 'type-devenement',
            optionId: 34,
            schemaId: 9661,
            slug: 'animation',
          },
        ],
      },
    );

    expect(v2Query).toEqual({ 'type-devenement': 34 });
  });
});
