'use strict';

const assert = require('assert');
const _ = require('lodash');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const fields = require('../lib/fields.json');
const fixtures = require('./fixtures');
const Service = require('..');

async function getAgendaDetailsByUid(uid, fields = []) {
  return _.pick(
    {
      id: { 7196947: 25221 }[uid],
      locationSetUid: { 7196947: 1903810 }[uid],
    },
    fields
  );
}

async function getEventCounts(locationUids, { agendaUid }) {
  return [
    {
      uid: 60763721,
      eventCount: 12,
      agendaEventCount: 8,
    },
    {
      uid: 51665985,
      eventCount: 9,
      agendaEventCount: 2,
    },
  ];
}

describe('agenda-locations - functional - list', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();
  });

  before(() => {
    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      imagePath: '//cibuldev.s3.amazonaws.com/',
      interfaces: {
        getAgendaDetailsByUid,
        getEventCounts,
      },
    });
  });

  describe('defaults', () => {
    let items;

    before(async () => {
      items = await svc(7196947).list();
    });

    it('list paginates by 20', async () => {
      assert.equal(items.length, 20);
    });

    it('id is not provided', async () => {
      assert.equal(items[0].id, undefined);
    });

    it('order is by descending id', async () => {
      assert.deepEqual(
        items.map(i => i.uid),
        [
          60763722,
          60763721,
          7630650,
          7630649,
          51665986,
          51665987,
          30433086,
          30433085,
          87316763,
          32049550,
          41253007,
          27638359,
          91723136,
          79091381,
          56366303,
          94482437,
          80369196,
          60725900,
          7749634,
          76306
        ]
      );
    });

    it('provided fields by default are name, address, latitude and longitude', () => {
      assert.deepEqual(Object.keys(items[0]), [
        'uid',
        'name',
        'address',
        'latitude',
        'longitude',
        'state',
      ]);
    });
  });

  describe('nav', () => {
    it('offset & limit', async () => {
      const items = await svc(7196947).list({}, { offset: 1, limit: 1 });
      const more = await svc(7196947).list({}, { offset: 0, limit: 2 });

      assert.equal(items[0].uid, more[1].uid);
    });

    it('nav with after means that response includes an after key', async () => {
      const { after } = await svc(7196947).list(
        {},
        { limit: 2, useAfter: true }
      );

      assert.equal(after, 976778);
    });

    it('after in previous call can be used to fetch next round of results', async () => {
      const { after } = await svc(7196947).list(
        {},
        { limit: 3, useAfter: true }
      );

      const { items } = await svc(7196947).list({}, { limit: 1, after });

      assert.equal(items[0].uid, 7630649);
    });
  });

  describe.only('filters', () => {
    it('"search" queries region field', async () => {
      const items = await svc(7196947).list({ search: 'nom de région' });

      assert.equal(items.length, 1);
      assert.equal(items[0].name, 'Abbatiale Sainte-Marie');
    });

    it('"search" queries department field', async () => {
      const items = await svc(7196947).list({ search: 'nom de département' });

      assert.equal(items.length, 1);
      assert.equal(items[0].name, 'Abbatiale Sainte-Marie');
    });

    it('"state" filters verified or unverified locations', async () => {
      const verified = await svc(7196947).list(
        { state: 1 },
        {},
        { detailed: true }
      );
      const unverified = await svc(7196947).list(
        { state: 0 },
        {},
        { detailed: true }
      );

      assert.equal(verified.length, verified.filter(l => l.state === 1).length);
      assert.equal(
        unverified.length,
        unverified.filter(l => l.state === 0).length
      );
    });

    it('"uids" filters by provided location uid list', async () => {
      const uids = [76248298, 10175539, 75940684];

      const selection = await svc(7196947).list({ uids });

      assert.equal(selection.length, 3);
      assert.deepEqual(
        selection.map(l => l.uid),
        uids
      );
    });

    it('"excludeUid" filter exclude provided location uid from list', async () => {
      const excludeUid = 76248298;

      const selection = await svc(7196947).list({ excludeUid });

      assert.equal(selection.find(e => e.uid === excludeUid), undefined);
    });

    it('"excludeUid" filter exclude provided locations uid from list', async () => {
      const excludeUid = [76248298, 10175539];

      const selection = await svc(7196947).list({ excludeUid });
      assert.equal(selection.find(e => e.uid === 10175539), undefined);
    });

    it('"geo" filter list locations in square', async () => {
      const geo = {
        northEast : {
          lat: 47,
          lng: 4,
        },
        southWest : {
          lat: 44,
          lng: 3,
        }
      }

      const selection = await svc(7196947).list({ geo });
      assert.equal(selection.length, 4)
    });

    it('"updatedAt.gte" filter', async () => {
      const gte = new Date('2019-09-05 14:45:18');

      const agendas = await svc(7196947).list({ updatedAt: { gte } }, {}, {
        detailed: true
      });

      assert(agendas.length > 0);
      agendas.forEach(agenda => {
        assert(agenda.updatedAt >= gte);
      });
    });

    it('"updatedAt.lte" filter', async () => {
      const lte = new Date('2019-09-05 14:45:18');

      const agendas = await svc(7196947).list({ updatedAt: { lte } }, {}, {
        detailed: true
      });

      assert(agendas.length > 0);
      agendas.forEach(agenda => {
        assert(agenda.updatedAt <= lte);
      });
    });

    it('fix: undefined uids are filtered out from query', async () => {
      await svc(7196947).list({ uids: [10175539, undefined] });
    });
  });

  describe('stream', function () {
    this.timeout(10000);

    it('stream streams', () => new Promise(done => {
      svc(7196947)
        .list({}, { limit: 0 }, { total: true })
        .then(({ total }) => {
          svc(7196947)
            .list({}, {}, { stream: true })
            .then(stream => {
              let count = 0;

              stream.on('data', location => {
                count++;
              });

              stream.on('end', () => {
                assert.equal(count, total);
                done();
              });
            });
        });
    }));

    it('emit an error', () => new Promise(done => {
      const throwingErrorSvc = Service({
        knex: f.client,
        Files: Files(dConfig.files),
        imagePath: '//cibuldev.s3.amazonaws.com/',
        interfaces: {
          getAgendaDetailsByUid,
          getEventCounts: () => {
            throw new Error('getEventCounts');
          },
        },
      });

      throwingErrorSvc(7196947)
        .list({}, { limit: 0 }, { total: true })
        .then(({ total }) => {
          throwingErrorSvc(7196947)
            .list({}, {}, { stream: true, eventCounts: true })
            .then(stream => {
              let count = 0;
              stream.on('data', location => {
                count++;
              });

              stream.on('error', err => {
                assert.equal(err.message, 'getEventCounts');
                done();
              });
            });
        });
    }));

    it('detailed option and includeTotal streams with totals and detailed fields', () => new Promise(done => {
      svc(7196947)
        .list(
          {},
          {},
          {
            stream: true,
            eventCounts: true,
            detailed: true,
          }
        )
        .then(stream => {
          stream.on('data', location => {
            assert.notStrictEqual(location.department, undefined);
            assert.notStrictEqual(location.eventCount, undefined);
          });

          stream.on('end', () => {
            done();
          });
        });
    }));
  });

  describe('detailed', () => {
    let items;

    before(async () => {
      items = await svc(7196947).list({}, {}, { detailed: true });
    });

    it('if detailed option is provided, all public fields are given', async () => {
      assert.deepEqual(
        Object.keys(items[0]),
        fields.filter(f => f.read.includes('public')).map(f => f.field)
      );
    });

    it('images do not include path by default', () => {
      assert.equal(items[0].image.split('/').length, 1);
    });

    it('images include path is includeImagePath option is true', async () => {
      const items = await svc(7196947).list(
        {},
        {},
        {
          includeImagePath: true,
          detailed: true,
        }
      );

      assert.ok(items[0].image.split('/').length > 1);
    });
  });

  describe('set', () => {
    let items;

    before(async () => {
      items = await svc.sets(1903810).locations.list();
    });

    it('retrieved locations belong to set', () => {
      assert(items.length === 4);
    });
  });

  describe('deleted', () => {

    it('soft deleted item not listed', async () => {
      const items = await svc(7196947).list();
      assert.equal(items.filter(i=> i.uid === 7630652).length, 0)
    });

    it('soft deleted item listed with option deleted: null', async () => {
      const items = await svc(7196947).list({},{}, { deleted: null });
      assert.equal(items.filter(i=> i.uid === 7630652).length, 1)

    });

    it('only soft deleted item listed with option deleted: true', async () => {
      const items = await svc(7196947).list({},{}, { deleted: true });
      assert.equal(items.filter(i=> i.uid === 7630652).length, 1)

    });
  });

  describe('other', () => {
    it('if fields option is specified, result data only includes fields provided', async () => {
      const items = await svc(7196947).list(
        {},
        { limit: 1 },
        {
          includeFields: ['uid', 'name'],
        }
      );

      assert.deepEqual(Object.keys(items[0]), ['uid', 'name']);
    });

    it('if getEventCounts interface is set and eventCount option is true, result includes interface-provided counts', async () => {
      const items = await svc(7196947).list(
        {},
        { limit: 3 },
        { eventCounts: true }
      );

      assert.deepEqual(
        items.map(i => _.pick(i, ['uid', 'eventCount', 'agendaEventCount'])),
        [{
            agendaEventCount: 0,
            eventCount: 0,
            uid: 60763722,
          },
          {
            uid: 60763721,
            eventCount: 12,
            agendaEventCount: 8,
          },
          {
            uid: 7630650,
            eventCount: 0,
            agendaEventCount: 0,
          },
        ]
      );
    });

    it('if total option is provided, list returns an { items, total } object', async () => {
      const { items, total } = await svc(7196947).list({}, {}, { total: true });

      assert.equal(total, 368);
    });
  });
});
