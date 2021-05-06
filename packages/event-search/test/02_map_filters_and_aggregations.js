'use strict';

const fs = require('fs');
const assert = require('assert');

const config = require('../testconfig');

const Service = require('..');

describe('02 - event search - functional: relative filter', () => {
  let service;

  before(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  before(async () => {
    await service('map').rebuild({
      eventsList: async (lastId, limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.map.json`)
      )
    })
  });

  it('filter on the region', async () => {
    const { events } = await service('map').search({
      region: 'Hauts-de-France'
    }, {}, { detailed: true });

    events.forEach(event => {
      assert.equal(event.location.region, 'Hauts-de-France')
    });
  });

  it('default geohash aggregation', async () => {
    const {
      aggregations: {
        geohash
      }
    } = await service('map').search({}, { size: 0 }, {
      aggregations: 'geohash',
    });

    assert.deepEqual(geohash, [
      {
        key: 'u140p',
        eventCount: 1,
        latitude: 50.64697265625,
        longitude: 3.14208984375
      },
      {
        key: 'u140j',
        eventCount: 1,
        latitude: 50.64697265625,
        longitude: 3.05419921875
      },
      {
        key: 'u08n9',
        eventCount: 1,
        latitude: 48.97705078125,
        longitude: 0.06591796875
      },
      {
        key: 'spc9c',
        eventCount: 1,
        latitude: 43.92333984375,
        longitude: 2.17529296875
      },
      {
        key: 'ezzx5',
        eventCount: 1,
        latitude: 44.84619140625,
        longitude: -0.54931640625
      }
    ]);
  });

  it('geohash with non-default precision', async () => {
    const {
      aggregations: {
        geohash
      }
    } = await service('map').search({}, { size: 0 }, {
      aggregations: {
        type: 'geohash',
        precision: 4
      }
    });

    assert.deepEqual(geohash, [
      {
        key: 'u140',
        eventCount: 2,
        latitude: 50.712890625,
        longitude: 2.98828125
      },
      {
        key: 'u08n',
        eventCount: 1,
        latitude: 48.955078125,
        longitude: 0.17578125
      },
      {
        key: 'spc9',
        eventCount: 1,
        latitude: 43.857421875,
        longitude: 2.28515625
      },
      {
        key: 'ezzx',
        eventCount: 1,
        latitude: 44.912109375,
        longitude: -0.52734375
      }
    ]);
  });

  it('viewport', async () => {
    const {
      aggregations: {
        viewport
      }
    } = await service('map').search({}, { size: 0 }, {
      aggregations: {
        type: 'viewport'
      }
    });

    assert.deepEqual(viewport, {
      topLeft: { latitude: 50.652663968503475, longitude: -0.5585790798068047 },
      bottomRight: { latitude: 43.92484896350652, longitude: 3.1450939178466797 }
    });
  });
});
