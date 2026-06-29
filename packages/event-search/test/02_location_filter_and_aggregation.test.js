import _ from 'lodash';
import Service from '../index.js';
import config from '../testconfig.js';
import eventFormSchemaWithLocationSchema from './fixtures/02_eventFormSchemaWithLocationSchema.json' with { type: 'json' };

describe('02 - event search - functional: location', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) {
      // console.log(e);
    }
  });

  beforeAll(async () => {
    await service('location').rebuild({
      formSchema: eventFormSchemaWithLocationSchema,
      eventsList: async (_lastId, _limit) =>
        (await import('./fixtures/02_events.location.json', { type: 'json' }))
          .default,
    });
  });

  describe('data', () => {
    it('includeFields on location returns only requested data', async () => {
      const {
        events: [event],
      } = await service('location').search(
        {},
        { size: 1 },
        {
          includeFields: ['location.uid', 'location.city', 'location.name'],
        },
      );

      expect(Object.keys(event.location)).toEqual(['uid', 'city', 'name']);
    });

    it('includeFields on adminLevel names maps result keys to requested names', async () => {
      const {
        events: [event],
      } = await service('location').search(
        {},
        { size: 1 },
        {
          includeFields: [
            'location.uid',
            'location.adminLevel4',
            'location.adminLevel6',
          ],
        },
      );

      expect(event.location).toEqual({
        uid: 1,
        adminLevel4: 'Paris',
        adminLevel6: 'Paris 02',
      });
    });

    it('includeFields on location', async () => {
      const {
        events: [event],
      } = await service('location').search(
        {},
        { size: 1 },
        { includeFields: ['location'] },
      );

      expect(Object.keys(event.location).length).toEqual(16);
    });
  });

  describe('filters', () => {
    it('all location info is provided if detailed option is specified', async () => {
      const { events } = await service('location').search(
        {},
        {},
        { detailed: true },
      );
      expect(
        _.uniq(events.filter((e) => e.location).map((e) => e.location.city)),
      ).toEqual(['Paris', 'Lille']);
    });

    it('city filter on "Paris"', async () => {
      const { events } = await service('location').search(
        {
          city: 'Paris',
        },
        {},
        { detailed: true },
      );

      expect(_.uniq(events.map((e) => e.location.city))).toEqual(['Paris']);
    });

    it('city filter on "Paris" includes fully pathed image in result with detailed & includeLocationImagePath options', async () => {
      const { events } = await service('location').search(
        { locationUid: 1 },
        {},
        {
          detailed: true,
          includeLocationImagePath: true,
        },
      );

      expect(events.filter((e) => e.location?.image).pop().location.image).toBe(
        'https://some.cdn/location123.jpg',
      );
    });

    it('adminLevel3 filter on "mel"', async () => {
      const { events } = await service('location').search(
        {
          adminLevel3: 'mel',
        },
        {},
        { detailed: true },
      );

      expect(_.uniq(events.map((e) => e.location.adminLevel3))).toEqual([
        'mel',
      ]);
    });

    it('adminLevel3 search on "mel"', async () => {
      const { events } = await service('location').search(
        {
          search: 'mel',
        },
        {},
        { detailed: true },
      );

      expect(_.uniq(events.map((e) => e.location.adminLevel3))).toEqual([
        'mel',
      ]);
    });

    it('adminLevel5 filter on "2eme"', async () => {
      const { events } = await service('location').search(
        {
          adminLevel5: '2eme',
        },
        {},
        { detailed: true },
      );

      expect(_.uniq(events.map((e) => e.location.adminLevel5))).toEqual([
        '2eme',
      ]);
    });

    it('adminLevel5 search on "2eme"', async () => {
      const { events } = await service('location').search(
        {
          search: '2eme',
        },
        {},
        { detailed: true },
      );

      expect(_.uniq(events.map((e) => e.location.adminLevel5))).toEqual([
        '2eme',
      ]);
    });

    it('adminLevel4 filter on "Paris" behaves like the city alias', async () => {
      const { events } = await service('location').search(
        {
          adminLevel4: 'Paris',
        },
        {},
        { detailed: true },
      );

      expect(_.uniq(events.map((e) => e.location.city))).toEqual(['Paris']);
    });

    it('adminLevel1 filter on "Hauts-de-France" behaves like the region alias', async () => {
      const { events } = await service('location').search(
        {
          adminLevel1: 'Hauts-de-France',
        },
        {},
        { detailed: true },
      );

      expect(_.uniq(events.map((e) => e.location.region))).toEqual([
        'Hauts-de-France',
      ]);
    });

    it('mixing the city alias and adminLevel4 keeps both values', async () => {
      const { events } = await service('location').search(
        {
          city: 'Paris',
          adminLevel4: 'Lille',
        },
        {},
        { detailed: true },
      );

      expect(_.uniq(events.map((e) => e.location.city)).sort()).toEqual([
        'Lille',
        'Paris',
      ]);
    });

    it('if nothing is explicitely requested, district key is provided rather than adminLevel6', async () => {
      const {
        events: [event],
      } = await service('location').search({}, { size: 1 }, { detailed: true });

      expect(event.location.district).toBeDefined();
    });

    it('if useAdminLevels option is true, adminLevel6 key is provided rather than district', async () => {
      const {
        events: [event],
      } = await service('location').search(
        {},
        { size: 1 },
        { detailed: true, useAdminLevels: true },
      );

      expect(event.location.adminLevel6).toBeDefined();
    });

    it('filter on empty location data', async () => {
      const { events } = await service('location').search(
        {
          city: 'null',
        },
        {},
        {
          detailed: true,
        },
      );

      expect(events.length).toBe(1);
      expect(events[0]?.location?.city).toBeUndefined();
    });

    it('filters on empty and non-empty location data', async () => {
      const { events } = await service('location').search(
        {
          city: ['null', 'Paris'],
        },
        {},
        {
          detailed: true,
        },
      );

      expect(_.uniq(events.map((e) => e?.location?.city))).toEqual([
        'Paris',
        undefined,
      ]);
    });

    it('filters on an additional field', async () => {
      const {
        events: [event],
      } = await service('location').search(
        {
          'location.protections-appellation-et-labels': 41,
        },
        {},
        {
          formSchema: eventFormSchemaWithLocationSchema,
          detailed: true,
        },
      );

      expect(event.uid).toBe(2);

      expect(
        event.location['protections-appellation-et-labels'].includes(41),
      ).toBe(true);
    });

    it('location additional field can be described using : as separator', async () => {
      const {
        events: [event],
      } = await service('location').search(
        {
          'location:protections-appellation-et-labels': 41,
        },
        {},
        {
          formSchema: eventFormSchemaWithLocationSchema,
          detailed: true,
        },
      );

      expect(event.uid).toBe(2);
    });

    it('filter on countryCode null', async () => {
      const { events } = await service('location').search(
        {
          countryCode: ['null'],
        },
        {},
        {
          detailed: true,
        },
      );
      expect(events.length).toBe(2);
    });

    it('filter on extId', async () => {
      const {
        events: [event],
      } = await service('location').search(
        {
          locationExtId: { key: 'default', value: '456' },
        },
        { size: 1 },
        { detailed: true },
      );

      expect(event.location.extIds).toStrictEqual([
        { key: 'default', value: '456' },
      ]);
      expect(event.location.extId).toBe(456);
    });
  });

  describe('aggregations', () => {
    it('adminLevel3 is a possible aggregation', async () => {
      const { aggregations } = await service('location').search(
        {
          state: null,
        },
        {},
        { detailed: true, aggregations: 'adminLevels3' },
      );

      expect(aggregations.adminLevels3).toEqual([
        { key: 'test', eventCount: 3 },
        { key: 'mel', eventCount: 1 },
      ]);
    });

    it('adminLevel5 is a possible aggregation', async () => {
      const { aggregations } = await service('location').search(
        {
          state: null,
        },
        {},
        { detailed: true, aggregations: 'adminLevels5' },
      );

      expect(aggregations.adminLevels5).toEqual([
        { key: '1er', eventCount: 1 },
        { key: '2eme', eventCount: 1 },
      ]);
    });

    it('countryCode is a possible aggregation', async () => {
      const { aggregations } = await service('location').search(
        {
          state: null,
        },
        {},
        { detailed: true, aggregations: 'countryCodes' },
      );

      expect(aggregations.countryCodes).toEqual([
        { key: 'FR', eventCount: 2 },
        { key: 'ES', eventCount: 1 },
      ]);
    });

    it('missing option to count events without cities', async () => {
      const { aggregations } = await service('location').search(
        {},
        {},
        {
          detailed: true,
          aggregations: [
            {
              key: 'littleFurryBunny',
              type: 'cities',
              missing: 'N/A',
            },
          ],
        },
      );

      expect(aggregations).toEqual({
        littleFurryBunny: [
          { key: 'Paris', eventCount: 3 },
          { key: 'Lille', eventCount: 1 },
          { key: 'N/A', eventCount: 1 },
        ],
      });
    });

    it('aggregations are possible on additional data', async () => {
      const { aggregations } = await service('location').search(
        {
          state: null,
        },
        { size: 0 },
        {
          formSchema: eventFormSchemaWithLocationSchema,
          detailed: true,
          aggregations: [
            {
              key: 'someLocationAdditionalField',
              field: 'location.protections-appellation-et-labels',
              type: 'additionalFields',
              missing: 'N/A',
            },
          ],
        },
      );

      expect(aggregations).toEqual({
        someLocationAdditionalField: [
          {
            id: 41,
            value: 'maison-des-illustres',
            label: 'Maison des illustres',
            key: 41,
            eventCount: 1,
          },
          {
            id: 50,
            value: 'architecture-contemporaine-remarquable',
            label: 'Architecture contemporaine remarquable',
            key: 50,
            eventCount: 1,
          },
        ],
      });
    });

    it('aggregations are possible on additional data using : as separator', async () => {
      const { aggregations } = await service('location').search(
        {
          state: null,
        },
        { size: 0 },
        {
          formSchema: eventFormSchemaWithLocationSchema,
          detailed: true,
          aggregations: [
            {
              key: 'someLocationAdditionalField',
              field: 'location:protections-appellation-et-labels',
              type: 'additionalFields',
              missing: 'N/A',
            },
          ],
        },
      );

      expect(aggregations.someLocationAdditionalField[0].value).toBe(
        'maison-des-illustres',
      );
    });

    it('aggregations can be requested in their shortened format', async () => {
      const options = {
        formSchema: eventFormSchemaWithLocationSchema,
        detailed: true,
        aggregations: [
          {
            key: 'someLocationAdditionalField',
            field: 'location:protections-appellation-et-labels',
            type: 'additionalFields',
            missing: 'N/A',
          },
        ],
      };

      const { aggregations: aggs1 } = await service('location').search(
        {
          state: null,
        },
        { size: 0 },
        options,
      );

      const { aggregations: aggs2 } = await service('location').search(
        {
          state: null,
        },
        { size: 0 },
        {
          ...options,
          aggregations: [
            {
              k: 'someLocationAdditionalField',
              f: 'location.protections-appellation-et-labels',
              t: 'af',
              m: 'N/A',
            },
          ],
        },
      );

      expect(aggs1).toEqual(aggs2);
    });
  });
});
