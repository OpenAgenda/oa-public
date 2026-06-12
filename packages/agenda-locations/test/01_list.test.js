import _ from 'lodash';

import Files from '@openagenda/files';

import fields from '../lib/fields.js';
import Service from '../index.js';
import testconfig from './testconfig.js';
import setup from './fixtures/setup.js';

const { service: config, dependencies: dConfig } = testconfig;

async function getAgendaDetailsByUid(uid, _fields = []) {
  return _.pick(
    {
      id: { 7196947: 25221 }[uid],
      locationSetUid: { 7196947: 1903810 }[uid],
    },
    fields,
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
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${import.meta.dirname}/fixtures/ardeche/rows.sql`],
    });

    svc = Service({
      knex,
      Files: Files(dConfig.files),
      imagePath: '//cdn.openagenda.com/dev/',
      interfaces: {
        getAgendaDetailsByUid,
        getEventCounts,
        getAgendaUidsByIds: async (_ids) =>
          _ids.map((id) => ({
            id,
            uid: Math.ceil(Math.random() * 99999999),
          })),
      },
    });
  });

  afterAll(() => knex?.destroy());

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
      expect(items.map((i) => i.uid)).toStrictEqual([
        60763722, 60763721, 7630653, 7630650, 7630649, 51665986, 51665987,
        30433086, 30433085, 87316763, 32049550, 41253007, 27638359, 91723136,
        79091381, 56366303, 94482437, 80369196, 60725900, 7749634,
      ]);
    });

    it('provided fields by default are name, address, latitude and longitude', () => {
      expect(Object.keys(items[0])).toStrictEqual([
        'uid',
        'name',
        'address',
        'latitude',
        'longitude',
        'state',
      ]);
    });

    it('fix: provided fields by default do not include image event if includeImagePath option is set', async () => {
      const items_ = await svc(7196947).list(
        {},
        {},
        { includeImagePath: true },
      );
      expect(Object.keys(items_[0])).toStrictEqual([
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

      expect(items[0].uid).toBe(more[1].uid);
    });

    it('nav with after means that response includes an after key', async () => {
      const { after } = await svc(7196947).list(
        {},
        { limit: 2, useAfter: true },
      );

      expect(after).toBe(976778);
    });

    it('after in previous call can be used to fetch next round of results', async () => {
      const { after } = await svc(7196947).list(
        {},
        { limit: 3, useAfter: true },
      );

      const { items } = await svc(7196947).list({}, { limit: 1, after });

      expect(items[0].uid).toBe(7630650);
    });

    it('order can by by asc name', async () => {
      const items = await svc(7196947).list(
        {},
        { order: 'name.asc', limit: 3 },
      );

      expect(items.map((i) => i.name).join(' - ')).toBe(
        items
          .map((i) => i.name)
          .sort((a, b) => a.localeCompare(b))
          .join(' - '),
      );
    });

    it('order on name with useAfter provides array in after key', async () => {
      const { after } = await svc(7196947).list(
        {},
        { order: 'name.asc', useAfter: true, limit: 3 },
      );

      expect(after).toEqual(['Ancien moulinage', 836469]);
    });

    it('after on name can be used to fetch next round of results', async () => {
      const { items } = await svc(7196947).list(
        {},
        {
          order: 'name.asc',
          useAfter: true,
          limit: 3,
          after: ['Ancien moulinage', 836469],
        },
      );

      expect(items.map((i) => i.name)).toEqual([
        'Ancienne église Saint-Jean-Baptiste',
        'Ancienne Usine de Soie du Moulinet',
        'Ancienne usine Murat',
      ]);
    });
  });

  describe('filters', () => {
    it('"search" queries region field', async () => {
      const items = await svc(7196947).list({ search: 'nom de région' });

      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Abbatiale Sainte-Marie');
    });

    it('utfmb4 search', async () => {
      let errors;

      try {
        await svc(7196947).list({
          search:
            '𝗦𝗮𝗹𝗹𝗲 𝟴𝟰𝟯 𝗟𝗼𝘀 𝗔𝗻𝗴𝗲𝗹𝗲𝘀, 𝗖𝗶𝘁𝗲́ 𝗺𝘂𝗻𝗶𝗰𝗶𝗽𝗮𝗹𝗲, 𝟰 𝗿𝘂𝗲 𝗖𝗹𝗮𝘂𝗱𝗲 𝗕𝗼𝗻𝗻𝗶𝗲𝗿, 𝗕𝗼𝗿𝗱𝗲𝗮𝘂𝘅',
        });
      } catch (e) {
        errors = e;
      }

      expect(errors).toBeUndefined();
    });

    it('search text exceeding 255 characters should throw validation error', async () => {
      const longSearchText = "Cette manifestation s'inscrit dans une démarche de continuité et de responsabilité. Elle n'enlève rien à la dimension collective de notre marche, qui demeure avant tout un mouvement ouvert, porté par celles et ceux qui, année après année, ont choisi de marcher ensemble.";

      let error;

      try {
        await svc(7196947).list({
          search: longSearchText,
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('invalid parameters');
      expect(error.info.errors).toBeDefined();
      expect(error.info.errors.length).toBeGreaterThan(0);
      expect(error.info.errors[0].code).toBe('string.toolong');
    });

    it('"search" queries department field', async () => {
      const items = await svc(7196947).list({ search: 'nom de département' });

      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Abbatiale Sainte-Marie');
    });

    // Tolerant search: tokenized (word-order independent) + relevance-ranked.
    // The fixture contains "Beffroi de l'Hôtel de Ville", a textbook generic
    // name whose words a contributor rarely types in the stored order.
    describe('tolerant search', () => {
      const BEFFROI = "Beffroi de l'Hôtel de Ville";

      it('is word-order independent: "ville hôtel" finds "...Hôtel de Ville" (failed before)', async () => {
        const items = await svc(7196947).list({ search: 'ville hôtel' });
        expect(items.some((i) => i.name === BEFFROI)).toBe(true);
      });

      it('tolerates missing accents and case: "HOTEL ville" finds the beffroi', async () => {
        const items = await svc(7196947).list({ search: 'HOTEL ville' });
        expect(items.some((i) => i.name === BEFFROI)).toBe(true);
      });

      it('ignores separators and order: "baptiste eglise" finds "Ancienne église Saint-Jean-Baptiste"', async () => {
        const items = await svc(7196947).list({ search: 'baptiste eglise' });
        expect(
          items.some((i) => i.name === 'Ancienne église Saint-Jean-Baptiste'),
        ).toBe(true);
      });

      it('drops stopwords so "hôtel de ville" is not over-constrained by "de"', async () => {
        const items = await svc(7196947).list({ search: 'hôtel de ville' });
        expect(items.some((i) => i.name === BEFFROI)).toBe(true);
      });

      it('single-word search still matches, accent-insensitive: "chateau"', async () => {
        const items = await svc(7196947).list(
          { search: 'chateau' },
          { limit: 300 },
        );
        expect(items.some((i) => i.name === "Château d'Alba-la-Romaine")).toBe(
          true,
        );
      });

      it('ranks the exact placename first: "château musée"', async () => {
        const items = await svc(7196947).list({ search: 'château musée' });
        expect(items[0].name).toBe('Château Musée');
      });

      it('paginates a ranked search consistently within the candidate window', async () => {
        // Ranking happens on a bounded window then is sliced by offset/limit, so
        // page1 + page2 must equal a single page2-sized fetch (no dupes/gaps and
        // the same relevance order across the boundary).
        const page1 = await svc(7196947).list(
          { search: 'chateau' },
          { offset: 0, limit: 3 },
        );
        const page2 = await svc(7196947).list(
          { search: 'chateau' },
          { offset: 3, limit: 3 },
        );
        const combined = await svc(7196947).list(
          { search: 'chateau' },
          { offset: 0, limit: 6 },
        );

        expect([...page1, ...page2].map((i) => i.uid)).toStrictEqual(
          combined.map((i) => i.uid),
        );
        // No overlap between the two pages.
        const overlap = page1
          .map((i) => i.uid)
          .filter((uid) => page2.some((i) => i.uid === uid));
        expect(overlap).toHaveLength(0);
      });

      it('tolerates a typo via the fuzzy fallback: "hotl ville" finds the beffroi', async () => {
        const items = await svc(7196947).list({ search: 'hotl ville' });
        expect(items.some((i) => i.name === BEFFROI)).toBe(true);
      });

      it('a genuinely unmatchable search still returns nothing', async () => {
        const items = await svc(7196947).list({
          search: 'zzzxqwk noplacelikethis',
        });
        expect(items.length).toBe(0);
      });

      it('escapes LIKE wildcards so a typed % is literal, not a wildcard', async () => {
        const plain = await svc(7196947).list({ search: 'région' });
        const wildcard = await svc(7196947).list({ search: 'région%' });
        expect(plain.length).toBeGreaterThan(0);
        expect(wildcard.length).toBe(0);
      });

      it('fuzzy fallback still applies eventCounts when the caller requests them', async () => {
        const items = await svc(7196947).list(
          { search: 'hotl ville' },
          { limit: 5 },
          { eventCounts: true },
        );
        const beffroi = items.find(
          (i) => i.name === "Beffroi de l'Hôtel de Ville",
        );
        expect(beffroi).toBeDefined();
        expect(beffroi.eventCount).toBeDefined();
      });

      it('an explicit order opts out of ranking (sorted enumeration)', async () => {
        const items = await svc(7196947).list(
          { search: 'saint' },
          { order: 'name.asc', limit: 10 },
        );
        const names = items.map((i) => i.name);
        expect(names.length).toBeGreaterThan(1);
        expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
      });

      it('total reflects the bounded match set in ranked mode', async () => {
        const { items, total } = await svc(7196947).list(
          { search: 'château' },
          { limit: 300 },
          { total: true },
        );
        expect(total).toBeGreaterThan(0);
        expect(total).toBe(items.length);
      });

      it('fuzzy fallback reports its full match-set size as total', async () => {
        const { items, total } = await svc(7196947).list(
          { search: 'hotl ville' },
          { limit: 5 },
          { total: true },
        );
        expect(items.length).toBeGreaterThan(0);
        expect(total).toBeGreaterThanOrEqual(items.length);
      });

      it('does not fire the fuzzy fallback in explicit-order (enumeration) mode', async () => {
        // 'hotl ville' has no exact matches; in ranked mode the fallback would
        // surface the beffroi, but an explicit order is an enumeration — it must
        // return the (empty) exact result, not fuzzy non-matches in distance order.
        const ranked = await svc(7196947).list({ search: 'hotl ville' });
        expect(ranked.length).toBeGreaterThan(0);

        const enumerated = await svc(7196947).list(
          { search: 'hotl ville' },
          { order: 'name.asc' },
        );
        expect(enumerated.length).toBe(0);
      });
    });

    it('"state" filters verified or unverified locations', async () => {
      const verified = await svc(7196947).list(
        { state: 1 },
        {},
        { detailed: true },
      );
      const unverified = await svc(7196947).list(
        { state: 0 },
        {},
        { detailed: true },
      );

      expect(verified.length).toBe(
        verified.filter((l) => l.state === 1).length,
      );
      expect(unverified.length).toBe(
        unverified.filter((l) => l.state === 0).length,
      );
    });

    it('"uids" filters by provided location uid list', async () => {
      const uids = [76248298, 10175539, 75940684];

      const selection = await svc(7196947).list({ uids });

      expect(selection.length).toBe(3);
      expect(selection.map((l) => l.uid)).toStrictEqual(uids);
    });

    it('"excludeUid" filter exclude provided location uid from list', async () => {
      const excludeUid = 76248298;

      const selection = await svc(7196947).list({ excludeUid });

      expect(selection.find((e) => e.uid === excludeUid)).toBeUndefined();
    });

    it('"excludeUid" filter exclude provided locations uid from list', async () => {
      const excludeUid = [76248298, 10175539];

      const selection = await svc(7196947).list({ excludeUid });
      expect(selection.find((e) => e.uid === 10175539)).toBeUndefined();
    });

    it('"geo" filter list locations in square', async () => {
      const geo = {
        northEast: {
          lat: 47,
          lng: 4,
        },
        southWest: {
          lat: 44,
          lng: 0.0,
        },
      };

      const selection = await svc(7196947).list({ geo });
      expect(selection.length).toBe(5);
    });

    it('"updatedAt.gte" filter', async () => {
      const gte = new Date('2019-09-05 14:45:18');

      const agendas = await svc(7196947).list(
        { 'updatedAt.gte': gte },
        {},
        {
          detailed: true,
        },
      );

      expect(agendas.length).toBeGreaterThan(0);
      agendas.forEach((agenda) => {
        expect(agenda.updatedAt >= gte).toBe(true);
      });
    });

    it('"updatedAt.gte" filter - legacy', async () => {
      const gte = new Date('2019-09-05 14:45:18');

      const agendas = await svc(7196947).list(
        { updatedAt: { gte } },
        {},
        {
          detailed: true,
        },
      );

      expect(agendas.length).toBeGreaterThan(0);
      agendas.forEach((agenda) => {
        expect(agenda.updatedAt >= gte).toBe(true);
      });
    });

    it('"updatedAt.lte" filter', async () => {
      const lte = new Date('2019-09-05 14:45:18');

      const agendas = await svc(7196947).list(
        { updatedAt: { lte } },
        {},
        {
          detailed: true,
        },
      );

      expect(agendas.length).toBeGreaterThan(0);
      agendas.forEach((agenda) => {
        expect(agenda.updatedAt <= lte).toBe(true);
      });
    });

    it('"createdAt.gte" filter', async () => {
      const gte = new Date('2019-09-05 14:45:18');

      const agendas = await svc(7196947).list(
        { createdAt: { gte } },
        {},
        {
          detailed: true,
        },
      );

      expect(agendas.length).toBeGreaterThan(0);
      agendas.forEach((agenda) => {
        expect(agenda.createdAt >= gte).toBe(true);
      });
    });

    it('"createdAt.lte" filter', async () => {
      const lte = new Date('2019-09-05 14:45:18');

      const agendas = await svc(7196947).list(
        { createdAt: { lte } },
        {},
        {
          detailed: true,
        },
      );

      expect(agendas.length).toBeGreaterThan(0);
      agendas.forEach((agenda) => {
        expect(agenda.createdAt <= lte).toBe(true);
      });
    });

    it('hasNull on adminLevel1 filter', async () => {
      const res = await svc(7196947).list(
        { hasNull: ['region'] },
        {},
        { detailed: true },
      );
      res.forEach((e) => {
        expect(e.region).toBe(null);
        expect(e.adminLevel1).toBe(null);
      });
    });

    it('hasNull on adminLevel2 filter', async () => {
      const res = await svc(7196947).list(
        { hasNull: ['adminLevel2'] },
        {},
        { detailed: true },
      );
      res.forEach((e) => {
        expect(e.department).toBe(null);
        expect(e.adminLevel2).toBe(null);
      });
    });

    it('hasNull on adminLevel1&2 filter', async () => {
      const resAdmLvl1 = await svc(7196947).list(
        { hasNull: ['region'] },
        {},
        { detailed: true },
      );
      const resAdmLvl2 = await svc(7196947).list(
        { hasNull: ['adminLevel2'] },
        {},
        { detailed: true },
      );
      const res = await svc(7196947).list(
        { hasNull: ['region', 'department'] },
        {},
        { detailed: true },
      );
      expect(res.length).toBe(Math.max(resAdmLvl1.length, resAdmLvl2.length));
    });

    it('fix: undefined uids are filtered out from query', async () => {
      // really strange test here
      const res = await svc(7196947).list({ uids: [10175539, undefined] });
      expect(res).not.toBeNull();
    });

    it('fix: "uids" filters by provided location uid list in string', async () => {
      const uids = '76248298, 10175539, 75940684';

      const selection = await svc(7196947).list({ uids });

      expect(selection.length).toBe(3);
      expect(selection.map((l) => l.uid)).toStrictEqual(
        uids.split(',').map(Number),
      );
    });

    it('extIds loaded', async () => {
      const res = await svc(7196947).list(
        { uids: [14471367] },
        {},
        { detailed: true },
      );
      expect(res[0].extIds).toStrictEqual([
        { key: 'default', value: '121,-22SSA' },
      ]);
    });

    it('locations can be filtered by extId', async () => {
      const locationByExtId = await svc(7196947).list({
        extId: { key: 'default', value: '1234' },
      });
      expect(locationByExtId.length).toBe(1);
      expect(locationByExtId[0].uid).toBe(7630653);
    });
  });

  describe('stream', () => {
    it('stream streams', () =>
      new Promise((done) => {
        svc(7196947)
          .list({}, { limit: 0 }, { total: true })
          .then(({ total }) => {
            svc(7196947)
              .list({}, {}, { stream: true })
              .then((stream) => {
                let count = 0;

                stream.on('data', (_location) => {
                  count += 1;
                });

                stream.on('end', () => {
                  expect(count).toBe(total);
                  done();
                });
              });
          });
      }));

    it('emit an error', () =>
      new Promise((done) => {
        const throwingErrorSvc = Service({
          knex,
          Files: Files(dConfig.files),
          imagePath: '//cdn.openagenda.com/dev/',
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
              .then((stream) => {
                stream.on('error', (err) => {
                  expect(err.message).toBe('getEventCounts');
                  done();
                });
              });
          });
      }));

    it('detailed option and includeTotal streams with totals and detailed fields', () =>
      new Promise((done) => {
        svc(7196947)
          .list(
            {},
            {},
            {
              stream: true,
              eventCounts: true,
              detailed: true,
            },
          )
          .then((stream) => {
            stream.on('data', (location) => {
              expect(location.department).not.toBeUndefined();
              expect(location.eventCount).not.toBeUndefined();
            });

            stream.on('end', () => {
              done();
            });
          });
      }));
  });

  describe('detailed', () => {
    let items;

    beforeAll(async () => {
      items = await svc(7196947).list({}, {}, { detailed: true });
    });

    it('if detailed option is provided, all public fields are given at the exception of the siret which is not provided when null', () => {
      expect(Object.keys(items[0])).toStrictEqual(
        fields
          .filter(
            (fi) =>
              fi.read.includes('public')
              && fi.field !== 'siret'
              && fi.field !== 'deleted',
          )
          .map((fi) => fi.field)
          .concat(['extId']), // Legacy compatibility field added by formatExtIds
      );
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
        },
      );
      expect(items_[0].image.split('/').length).toBeGreaterThan(1);
    });

    it('duplicates candidates are fetch with detailed option', async () => {
      const items_ = await svc(7196947).list(
        {},
        {},
        {
          detailed: true,
        },
      );
      expect(
        items_.filter((e) => e.slug === 'grotte-chauvet-2-ardeche327')[0]
          .duplicateCandidates,
      ).toStrictEqual([51665986]);
      expect(
        items_.filter((e) => e.slug === 'grotte-chauvet-2-ardeche327')[0]
          .disqualifiedDuplicates,
      ).toStrictEqual([5]);
    });

    it('adminLvls are fetch with detailed option', async () => {
      const items_ = await svc(7196947).list(
        {},
        {},
        {
          detailed: true,
        },
      );
      expect(items_[0].adminLevel1).toBe('Auvergne-Rhône-Alpes');
      expect(items_[0].adminLevel2).toBe('Ardèche');
    });

    it('if siret is not stored in store, it is not presented even when detailed is true', async () => {
      const res = await svc(7196947).list(
        { uids: [44326184] },
        {},
        { detailed: true },
      );

      expect(res[0].siret).toBeUndefined();
    });

    it('if siret is stored in store, it is presented when detailed is true', async () => {
      const res = await svc(7196947).list(
        { uids: [17391791] },
        {},
        { detailed: true },
      );
      expect(res[0].siret).toBe('12345678901234');
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
      expect(items.filter((i) => i.uid === 7630652).length).toBe(0);
    });

    it('soft deleted item listed with option deleted: null', async () => {
      const items = await svc(7196947).list({}, {}, { deleted: null });
      expect(items.filter((i) => i.uid === 7630652).length).toBe(1);
    });

    it('only soft deleted item listed with option deleted: true', async () => {
      const items = await svc(7196947).list({}, {}, { deleted: true });
      expect(items.filter((i) => i.uid === 7630652).length).toBe(1);
    });
  });

  describe('other', () => {
    it('if fields option is specified, result data only includes fields provided', async () => {
      const items = await svc(7196947).list(
        {},
        { limit: 1 },
        {
          includeFields: ['uid', 'name'],
        },
      );

      expect(Object.keys(items[0])).toStrictEqual(['uid', 'name']);
    });

    it('if includeFields option includes agendaUid, origin agenda uid is provided in result', async () => {
      const items = await svc(7196947).list(
        {},
        { limit: 1 },
        {
          includeFields: ['agendaUid'],
        },
      );

      expect(typeof items[0].agendaUid).toBe('number');
    });

    it('if getEventCounts interface is set and eventCount option is true, result includes interface-provided counts', async () => {
      const items = await svc(7196947).list(
        {},
        { limit: 3 },
        { eventCounts: true },
      );

      expect(
        items.map((i) => _.pick(i, ['uid', 'eventCount', 'agendaEventCount'])),
      ).toStrictEqual([
        {
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
          uid: 7630653,
          eventCount: 0,
          agendaEventCount: 0,
        },
      ]);
    });

    it('if total option is provided, list returns an { items, total } object', async () => {
      const { items, total } = await svc(7196947).list({}, {}, { total: true });
      expect(total).toBe(369);
      expect(items).not.toBeNull();
    });
  });
});
