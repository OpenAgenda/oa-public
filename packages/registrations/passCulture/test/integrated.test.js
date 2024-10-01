import 'dotenv/config';

import PassCulture from '../index.js';

const {
  PASS_API_KEY: key,
  PASS_SIREN: singleSiren,
  PASS_API_DOMAIN: api,
  GET_PARAMS_PASS_SIRENS: multiSiren,
  GET_PARAMS_PASS_API_DOMAIN: multiSirenApi,
  GET_PARAMS_PASS_API_KEY: multiSirenKey,
} = process.env;

describe('integrated', () => {
  let pc;
  beforeAll(() => {
    pc = PassCulture({ key, api }, { siren: singleSiren });
  });

  describe('getParameters', () => {
    it('gets available categories, related offers and offerer venues', async () => {
      const pcParams = await pc.getParameters();

      expect(pcParams.offererVenues.length).toBe(1);

      expect(Object.keys(pcParams)).toEqual([
        'categories',
        'related',
        'offererVenues',
      ]);
    });

    it('multiple sirens set returns matching multiple offererVenues', async () => {
      const pcWithMultiSiren = PassCulture(
        {
          key: multiSirenKey,
          api: multiSirenApi,
        },
        { siren: multiSiren.split(',') },
      );

      const { offererVenues } = await pcWithMultiSiren.getParameters();

      expect(offererVenues.length).toBe(2);
    });
  });
});
