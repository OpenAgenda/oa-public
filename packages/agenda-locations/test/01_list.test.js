'use strict';

const _ = require('lodash');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const fields = require('../lib/fields');
const Service = require('..');
const fixtures = require('./fixtures');

async function getAgendaDetailsByUid(uid, _fields = []) {
  return _.pick(
    {
      id: { 7196947: 25221 }[uid],
      locationSetUid: { 7196947: 1903810 }[uid],
    },
    fields
  );
}

async function getEventCounts(_locationUids, { _agendaUid }) {
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

describe('agenda-locations - functional - list', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();
  });

  beforeAll(() => {
    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      imagePath: '//cibuldev.s3.amazonaws.com/',
      interfaces: {
        getAgendaDetailsByUid,
        getEventCounts,
        getAgendaUidsByIds: async _ids => (_ids.map(id => ({
          id,
          uid: Math.ceil(Math.random() * 99999999)
        })))
      },
    });
  });

  describe('defaults', () => {
    let items;

    beforeAll(async () => {
      items = await svc(7196947).list();
    });

    it('list paginates by 20', async () => {
      expect(items.length).toBe(20);
    });

    it('id is not provided', async () => {
      expect(items[0].id).toBeUndefined();
    });

    it('order is by descending id', async () => {
      expect(items.map(i => i.uid)).toStrictEqual(
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

    it(
      'provided fields by default are name, address, latitude and longitude',
      () => {
        expect(Object.keys(items[0])).toStrictEqual([
          'uid',
          'name',
          'address',
          'latitude',
          'longitude',
          'state',
        ]);
      }
    );

    it(
      'fix: provided fields by default do not include image event if includeImagePath option is set',
      async () => {
        const items_ = await svc(7196947).list({}, {}, { includeImagePath: true });
        expect(Object.keys(items_[0])).toStrictEqual([
          'uid',
          'name',
          'address',
          'latitude',
          'longitude',
          'state',
        ]);
      }
    );
  });

  describe('nav', () => {
    it('offset & limit', async () => {
      const items = await svc(7196947).list({}, { offset: 1, limit: 1 });
      const more = await svc(7196947).list({}, { offset: 0, limit: 2 });

      expect(items[0].uid).toBe(more[1].uid);
    });

    it('nav with after means that response includes an after key', async () => {
      const { after } = await svc(7196947).list(
        {},
        { limit: 2, useAfter: true }
      );

      expect(after).toBe(976778);
    });

    it(
      'after in previous call can be used to fetch next round of results',
      async () => {
        const { after } = await svc(7196947).list(
          {},
          { limit: 3, useAfter: true }
        );

        const { items } = await svc(7196947).list({}, { limit: 1, after });

        expect(items[0].uid).toBe(7630649);
      }
    );
  });

  describe('filters', () => {
    it('"search" queries region field', async () => {
      const items = await svc(7196947).list({ search: 'nom de région' });

      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Abbatiale Sainte-Marie');
    });

    it('"search" queries department field', async () => {
      const items = await svc(7196947).list({ search: 'nom de département' });

      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Abbatiale Sainte-Marie');
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

      expect(verified.length).toBe(verified.filter(l => l.state === 1).length);
      expect(unverified.length).toBe(unverified.filter(l => l.state === 0).length);
    });

    it('"uids" filters by provided location uid list', async () => {
      const uids = [76248298, 10175539, 75940684];

      const selection = await svc(7196947).list({ uids });

      expect(selection.length).toBe(3);
      expect(selection.map(l => l.uid)).toStrictEqual(uids);
    });

    it(
      '"excludeUid" filter exclude provided location uid from list',
      async () => {
        const excludeUid = 76248298;

        const selection = await svc(7196947).list({ excludeUid });

        expect(selection.find(e => e.uid === excludeUid)).toBeUndefined();
      }
    );

    it(
      '"excludeUid" filter exclude provided locations uid from list',
      async () => {
        const excludeUid = [76248298, 10175539];

        const selection = await svc(7196947).list({ excludeUid });
        expect(selection.find(e => e.uid === 10175539)).toBeUndefined();
      }
    );

    it('"geo" filter list locations in square', async () => {
      const geo = {
        northEast: {
          lat: 47,
          lng: 4,
        },
        southWest: {
          lat: 44,
          lng: 0.0,
        }
      };

      const selection = await svc(7196947).list({ geo });
      console.log(selection);
      expect(selection.length).toBe(4);
    });

    it('"updatedAt.gte" filter', async () => {
      const gte = new Date('2019-09-05 14:45:18');

      const agendas = await svc(7196947).list({ updatedAt: { gte } }, {}, {
        detailed: true
      });

      expect(agendas.length).toBeGreaterThan(0);
      agendas.forEach(agenda => {
        expect(agenda.updatedAt >= gte).toBe(true);
      });
    });

    it('"updatedAt.lte" filter', async () => {
      const lte = new Date('2019-09-05 14:45:18');

      const agendas = await svc(7196947).list({ updatedAt: { lte } }, {}, {
        detailed: true
      });

      expect(agendas.length).toBeGreaterThan(0);
      agendas.forEach(agenda => {
        expect(agenda.updatedAt <= lte).toBe(true);
      });
    });

    it('hasNull on adminLevel1 filter', async () => {
      const res = await svc(7196947).list({ hasNull: ['region'] }, {}, { detailed: true });
      res.forEach(e => {
        expect(e.region).toBe(null);
        expect(e.adminLevel1).toBe(null);
      });
    });

    it('hasNull on adminLevel2 filter', async () => {
      const res = await svc(7196947).list({ hasNull: ['adminLevel2'] }, {}, { detailed: true });
      res.forEach(e => {
        expect(e.department).toBe(null);
        expect(e.adminLevel2).toBe(null);
      });
    });

    it('hasNull on adminLevel1&2 filter', async () => {
      const resAdmLvl1 = await svc(7196947).list({ hasNull: ['region'] }, {}, { detailed: true });
      const resAdmLvl2 = await svc(7196947).list({ hasNull: ['adminLevel2'] }, {}, { detailed: true });
      const res = await svc(7196947).list({ hasNull: ['region', 'department'] }, {}, { detailed: true });
      expect(res.length).toBe(Math.max(resAdmLvl1.length, resAdmLvl2.length));
    });

    it('fix: undefined uids are filtered out from query', async () => { // really strange test here
      const res = await svc(7196947).list({ uids: [10175539, undefined] });
      expect(res).not.toBeNull();
    });

    it('fix: if extId is stored in store, it is loaded', async () => {
      const res = await svc(7196947).list({ uids: [87202261] }, {}, { detailed: true });
      expect(res[0].extId).toBe('ard_leg_01');
    });
  });

  describe('stream', () => {
    it('stream streams', () => new Promise(done => {
      svc(7196947)
        .list({}, { limit: 0 }, { total: true })
        .then(({ total }) => {
          svc(7196947)
            .list({}, {}, { stream: true })
            .then(stream => {
              let count = 0;

              stream.on('data', _location => {
                count += 1;
              });

              stream.on('end', () => {
                expect(count).toBe(total);
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
        .then(({ _total }) => {
          throwingErrorSvc(7196947)
            .list({}, {}, { stream: true, eventCounts: true })
            .then(stream => {
              stream.on('error', err => {
                expect(err.message).toBe('getEventCounts');
                done();
              });
            });
        });
    }));

    it(
      'detailed option and includeTotal streams with totals and detailed fields',
      () => new Promise(done => {
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
              expect(location.department).not.toBeUndefined();
              expect(location.eventCount).not.toBeUndefined();
            });

            stream.on('end', () => {
              done();
            });
          });
      })
    );
  });

  describe('detailed', () => {
    let items;

    beforeAll(async () => {
      items = await svc(7196947).list({}, {}, { detailed: true });
    });

    it('if detailed option is provided, all public fields are given', () => {
      expect(Object.keys(items[0])).toStrictEqual(fields.filter(fi => fi.read.includes('public')).map(fi => fi.field));
    });

    it('images do not include path by default', () => {
      expect(items[0].image.split('/').length).toBe(1);
    });

    it('images include path is includeImagePath option is true', async () => {
      const items_ = await svc(7196947).list(
        {},
        {},
        {
          includeImagePath: true,
          detailed: true,
        }
      );
      expect(items_[0].image.split('/').length).toBeGreaterThan(1);
    });

    it('duplicates candidates are fetch with detailed option', async () => {
      const items_ = await svc(7196947).list(
        {},
        {},
        {
          detailed: true,
        }
      );
      expect(items_.filter(e => e.slug === 'grotte-chauvet-2-ardeche327')[0].duplicateCandidates).toStrictEqual([51665986]);
      expect(items_.filter(e => e.slug === 'grotte-chauvet-2-ardeche327')[0].disqualifiedDuplicates).toStrictEqual([5]);
    });

    it('adminLvls are fetch with detailed option', async () => {
      const items_ = await svc(7196947).list(
        {},
        {},
        {
          detailed: true,
        }
      );
      expect(items_[0].adminLevel1).toBe('Auvergne-Rhône-Alpes');
      expect(items_[0].adminLevel2).toBe('Ardèche');
    });
  });

  describe('set', () => {
    let items;

    beforeAll(async () => {
      items = await svc.sets(1903810).locations.list();
    });

    it('retrieved locations belong to set', () => {
      expect(items.length).toBe(4);
    });
  });

  describe('deleted', () => {
    it('soft deleted item not listed', async () => {
      const items = await svc(7196947).list();
      expect(items.filter(i => i.uid === 7630652).length).toBe(0);
    });

    it('soft deleted item listed with option deleted: null', async () => {
      const items = await svc(7196947).list({}, {}, { deleted: null });
      expect(items.filter(i => i.uid === 7630652).length).toBe(1);
    });

    it('only soft deleted item listed with option deleted: true', async () => {
      const items = await svc(7196947).list({}, {}, { deleted: true });
      expect(items.filter(i => i.uid === 7630652).length).toBe(1);
    });
  });

  describe('other', () => {
    it(
      'if fields option is specified, result data only includes fields provided',
      async () => {
        const items = await svc(7196947).list(
          {},
          { limit: 1 },
          {
            includeFields: ['uid', 'name'],
          }
        );

        expect(Object.keys(items[0])).toStrictEqual(['uid', 'name']);
      }
    );

    it(
      'if includeFields option includes agendaUid, origin agenda uid is provided in result',
      async () => {
        const items = await svc(7196947).list(
          {},
          { limit: 1 },
          {
            includeFields: ['agendaUid']
          }
        );

        expect(typeof items[0].agendaUid).toBe('number');
      }
    );

    it(
      'if getEventCounts interface is set and eventCount option is true, result includes interface-provided counts',
      async () => {
        const items = await svc(7196947).list(
          {},
          { limit: 3 },
          { eventCounts: true }
        );

        expect(items.map(i => _.pick(i, ['uid', 'eventCount', 'agendaEventCount']))).toStrictEqual(
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
      }
    );

    it(
      'if total option is provided, list returns an { items, total } object',
      async () => {
        const { items, total } = await svc(7196947).list({}, {}, { total: true });
        expect(total).toBe(368);
        expect(items).not.toBeNull();
      }
    );
  });
});
