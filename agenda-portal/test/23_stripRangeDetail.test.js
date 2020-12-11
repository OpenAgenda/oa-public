'use strict';

const stripRangeDetail = require('../utils/stripRangeDetail');

describe('23 - lib/utils - stripRangeDetail', () => {
  test('weekday is stripped', () => {
    expect(
      stripRangeDetail('19 septembre 2020 - 19 juin 2021, les samedis')
    ).toEqual('19 septembre 2020 - 19 juin 2021');
  });
});
