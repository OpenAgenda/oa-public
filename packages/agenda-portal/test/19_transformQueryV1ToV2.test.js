'use strict';

const transformQueryV1ToV2 = require('../lib/utils/transformQueryV1ToV2');

describe('19 - lib/utils - transformQueryV1ToV2', () => {
  test('oaq date filter is converted to timezoned lte/gte pair', () => {
    const v2Query = transformQueryV1ToV2(
      {
        from: '2020-05-17',
        to: '2020-05-22'
      },
      { timezone: 'Europe/Paris' }
    );

    expect(v2Query).toEqual({
      date: {
        gte: '2020-05-17T00:00:00+02:00',
        lte: '2020-05-22T23:59:00+02:00'
      }
    });
  });
});
