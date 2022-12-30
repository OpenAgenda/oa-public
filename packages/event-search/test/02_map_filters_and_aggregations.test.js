'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: relative filter', () => {
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
    await service('map').rebuild({
      eventsList: async (_lastId, _limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.map.json`),
      ),
    });
  });

  it('filter on the region', async () => {
    const { events } = await service('map').search({
      region: 'Hauts-de-France',
    }, {}, { detailed: true });

    events.forEach(event => {
      expect(event.location.region).toBe('Hauts-de-France');
    });
  });

  it('default geohash aggregation', async () => {
    const {
      aggregations: {
        geohash,
      },
    } = await service('map').search({}, { size: 0 }, {
      aggregations: 'geohash',
    });

    expect(geohash).toEqual([
      {
        key: 'u1',
        eventCount: 5,
        latitude: 47.80292777437717,
        longitude: 1.5775871649384499,
      },
    ]);
  });

  it('geohash with non-default precision', async () => {
    const {
      aggregations: {
        geohash,
      },
    } = await service('map').search({}, { size: 0 }, {
      aggregations: {
        type: 'geohash',
        zoom: 6,
      },
    });

    expect(geohash).toEqual([
      {
        key: 'u140',
        eventCount: 2,
        latitude: 50.64057198353112,
        longitude: 3.101834957487881,
      },
      {
        key: 'u08n',
        eventCount: 1,
        latitude: 48.96736695896834,
        longitude: 0.07470999844372272,
      },
      {
        key: 'spc9',
        eventCount: 1,
        latitude: 43.92484896350652,
        longitude: 2.168134991079569,
      },
      {
        key: 'ezzx',
        eventCount: 1,
        latitude: 44.84127898234874,
        longitude: -0.5585790798068047,
      },
    ]);
  });

  it('viewport', async () => {
    const {
      aggregations: {
        viewport,
      },
    } = await service('map').search({}, { size: 0 }, {
      aggregations: {
        type: 'viewport',
      },
    });

    expect(viewport).toEqual({
      topLeft: { latitude: 50.652663968503475, longitude: -0.5585790798068047 },
      bottomRight: { latitude: 43.92484896350652, longitude: 3.1450939178466797 },
    });
  });
});
