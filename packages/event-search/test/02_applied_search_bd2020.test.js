'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: bd2020', () => {
  let service;

  const formSchema = JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bd2020.schema.json`));

  beforeAll(() => {
    service = Service(config);
  });

  beforeAll(async () => {
    try {
      await service.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) {
      // console.log(e)
    }
  });

  beforeAll(async () => {
    await service('bd2020').rebuild({
      eventsList: async (lastId, limit) =>
        JSON.parse(fs.readFileSync(`${__dirname}/fixtures/applied/bd2020.${lastId}.${limit}.json`)),
      formSchema,
    });
  });

  describe('Access', () => {
    let eventForPublic;
    let eventForAdmin;

    beforeAll(async () => {
      eventForPublic = await service('bd2020').search({
        uid: 96490567,
      }, {}, { formSchema }).then(r => r.events[0]);

      eventForAdmin = await service('bd2020').search({
        uid: 96490567,
      }, {}, { formSchema, access: 'administrator' }).then(r => r.events[0]);
    });

    it(
      'info of restricted access is not provided if access is not provided',
      () => {
        expect(eventForPublic.particularites).toBe(undefined);
      },
    );

    it('info of restricted access is provided if access is not provided', () => {
      expect(eventForAdmin.particularites).toEqual([776]);
    });
  });

  describe('Explicit includes', () => {
    let eventForPublic;
    let eventForAdmin;

    const includeFields = [
      'uid',
      'type-devenement',
      'particularites',
    ];

    beforeAll(async () => {
      eventForPublic = await service('bd2020').search({
        uid: 96490567,
      }, {}, {
        formSchema,
        includeFields,
        maintainedFields: ['dateRange', 'country'],
      }).then(r => r.events[0]);

      eventForAdmin = await service('bd2020').search({
        uid: 96490567,
      }, {}, {
        formSchema,
        access: 'administrator',
        includeFields,
        maintainedFields: ['dateRange', 'country'],
      }).then(r => r.events[0]);
    });

    it(
      'explicit includes limit returned fields to specified values and of public access',
      () => {
        expect(Object.keys(eventForPublic)).toEqual(['uid', 'type-devenement']);
      },
    );

    it(
      'explicit includes limit retured fields to specified value including specified access',
      () => {
        expect(Object.keys(eventForAdmin)).toEqual(['uid', 'particularites', 'type-devenement']);
      },
    );
  });

  describe('Metric aggregation', () => {
    it('gets a max and an average', async () => {
      const agg = await service('bd2020').search({
        state: null,
      }, { size: 0 }, {
        detailed: true,
        formSchema,
        aggregations: [{
          key: 'des_metriques_sur_les_places',
          type: 'additionalFieldMetrics',
          field: 'places',
          metrics: ['max', 'avg'],
        }],
      }).then(r => r.aggregations.des_metriques_sur_les_places);

      expect(agg).toEqual({
        max: 1324,
        avg: 210.5,
      });
    });
  });
});
