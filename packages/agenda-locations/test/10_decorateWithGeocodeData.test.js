import decorateWithGeocodeData from '../lib/decorateWithGeocodeData.js';

describe('decorateWithGeocodeData', () => {
  let decorate;

  beforeAll(async () => {
    decorate = decorateWithGeocodeData({
      getINSEECode: (_geocodeData) => '56000',
      interfaces: {
        geocode: async (_address) => [
          {
            latitude: 47.6576571,
            longitude: -2.7834928,
            adminLevel2: 'Morbihan',
            adminLevel1: 'La région',
            adminLevel4: 'Vannes',
          },
        ],
        reverseGeocode: async (_latitude, _longitude) => [
          {
            address: 'an address',
            adminLevel1: 'La région2',
            adminLevel2: 'Morbihan2',
            adminLevel4: 'Vannes2',
            countryCode: 'FR',
          },
        ],
      },
    });
  });

  describe('shouldAttempt', () => {
    it('should return false if autocomplete is false', async () => {
      const shouldAttempt = decorate.shouldAttempt(false, null, null);
      expect(shouldAttempt).toBe(false);
    });
    it('should return false if no data and adminLevels are definied', async () => {
      const shouldAttempt = decorate.shouldAttempt(true, null, true, {
        adminLevel1: 'La région2',
        adminLevel2: 'Morbihan2',
        adminLevel4: 'Vannes2',
      });
      expect(shouldAttempt).toBe(false);
    });

    it('should return true if address and countrycode are patch', async () => {
      const shouldAttempt = decorate.shouldAttempt(
        true,
        { address: 'an address', countryCode: 'FR' },
        true,
      );
      expect(shouldAttempt).toBe(true);
    });

    it('should return true if lat or long are patch', async () => {
      const shouldAttempt = decorate.shouldAttempt(
        true,
        { latitude: 48.6576571 },
        true,
      );
      expect(shouldAttempt).toBe(true);
    });

    it('should return true if adminLevels are incomplete', async () => {
      const shouldAttempt = decorate.shouldAttempt(true, {}, true, {
        adminLevel1: 'La région2',
      });
      expect(shouldAttempt).toBe(true);
    });
  });

  describe('decorate on create', () => {
    it('should return the same data if no data', async () => {
      const data = await decorate({}, null);
      expect(data).toEqual({});
    });

    it('should return geocoded data if address and countryCode', async () => {
      const data = await decorate(
        { address: 'something', countryCode: 'FR' },
        null,
      );
      expect(data).toStrictEqual({
        address: 'something',
        countryCode: 'FR',
        adminLevel1: 'La région',
        adminLevel2: 'Morbihan',
        adminLevel4: 'Vannes',
        latitude: 47.6576571,
        longitude: -2.7834928,
        insee: '56000',
      });
    });

    it('should return reversegeocoded data if lat and long', async () => {
      const data = await decorate(
        { latitude: 48.6576571, longitude: -2.7834928 },
        null,
      );
      expect(data).toStrictEqual({
        address: 'an address',
        adminLevel1: 'La région2',
        adminLevel2: 'Morbihan2',
        adminLevel4: 'Vannes2',
        countryCode: 'FR',
        latitude: 48.6576571,
        longitude: -2.7834928,
        insee: '56000',
      });
    });
  });

  describe('decorate on patch', () => {
    it('should return the same data if no data', async () => {
      const data = await decorate({}, {});
      expect(data).toEqual({});
    });

    it('should return geocoded data if address is changed', async () => {
      const data = await decorate(
        { address: 'something other thing' },
        { address: 'something', countryCode: 'FR' },
      );
      expect(data).toStrictEqual({
        address: 'something other thing',
        countryCode: 'FR',
        adminLevel1: 'La région',
        adminLevel2: 'Morbihan',
        adminLevel4: 'Vannes',
        latitude: 47.6576571,
        longitude: -2.7834928,
        insee: '56000',
      });
    });

    it('should return geocoded data if contryCode is changed', async () => {
      const data = await decorate(
        { countryCode: 'FR' },
        { address: 'something', countryCode: 'ES' },
      );
      expect(data).toStrictEqual({
        address: 'something',
        countryCode: 'FR',
        adminLevel1: 'La région',
        adminLevel2: 'Morbihan',
        adminLevel4: 'Vannes',
        latitude: 47.6576571,
        longitude: -2.7834928,
        insee: '56000',
      });
    });

    it('should return reverseGeocoded data if lat is changed', async () => {
      const data = await decorate(
        { latitude: 48.6576571 },
        { latitude: 47.6576571, longitude: -2.7834928 },
      );
      expect(data).toStrictEqual({
        address: 'an address',
        adminLevel1: 'La région2',
        adminLevel2: 'Morbihan2',
        adminLevel4: 'Vannes2',
        countryCode: 'FR',
        latitude: 48.6576571,
        longitude: -2.7834928,
        insee: '56000',
      });
    });

    it('should return reverseGeocoded data if long is changed', async () => {
      const data = await decorate(
        { longitude: -3.7834928 },
        { latitude: 47.6576571, longitude: -2.7834928 },
      );
      expect(data).toStrictEqual({
        address: 'an address',
        adminLevel1: 'La région2',
        adminLevel2: 'Morbihan2',
        adminLevel4: 'Vannes2',
        countryCode: 'FR',
        latitude: 47.6576571,
        longitude: -3.7834928,
        insee: '56000',
      });
    });

    it('should return reverseGeocoded if adminLevles are incomplete', async () => {
      const data = await decorate(
        {},
        { latitude: 47.6576571, longitude: -2.7834928 },
      );
      expect(data).toStrictEqual({
        address: 'an address',
        adminLevel1: 'La région2',
        adminLevel2: 'Morbihan2',
        adminLevel4: 'Vannes2',
        countryCode: 'FR',
        latitude: 47.6576571,
        longitude: -2.7834928,
        insee: '56000',
      });
    });

    it('should not overide entry data', async () => {
      const data = await decorate(
        { address: 'something new', countryCode: 'FR', adminLevel2: 'Truc' },
        {
          address: 'something',
          countryCode: 'FR',
          latitude: 48.6576571,
          longitude: -2.7834928,
        },
      );
      expect(data).toStrictEqual({
        address: 'something new',
        countryCode: 'FR',
        adminLevel2: 'Truc',
        department: 'Truc',
        adminLevel1: 'La région',
        adminLevel4: 'Vannes',
        latitude: 47.6576571,
        longitude: -2.7834928,
        insee: '56000',
      });
    });
  });
});
