import Service from '../service/index.js';
import config from './config.js';
import listInterface from './app/listInterface.js';
import getDetailedAgenda from './app/getDetailedAgenda.js';

describe('01 - Search', () => {
  let svc;

  beforeAll(() => {
    svc = Service({
      elasticsearch: config.elasticsearch,
      alias: config.alias,
      defaultImage: config.defaultImage,
      listAgendas: listInterface('test', 100),
      getDetailedAgenda: getDetailedAgenda('test', (a) => {
        if (a.uid === 3) {
          a.updatedAt = new Date();
        }
        return a;
      }),
    });
  });

  beforeAll(() => svc.rebuild());

  describe('Default (no searches, no filters, no options)', () => {
    let result;

    beforeAll(async () => {
      result = await svc({});
    });

    it('updated recently appears first', () => {
      expect(result.agendas[0].uid).toEqual(3);
    });

    it('returns fields are limited to basic list', () => {
      const fields = Object.keys(result.agendas[0]);
      expect(fields.includes('uid')).toBeTruthy();
      expect(!fields.includes('summary')).toBeTruthy();
    });
  });

  describe('Title', () => {
    it('Exact match', async () => {
      const { agendas } = await svc({
        search: 'La Roche-Posay',
      });

      expect(agendas[0].title).toEqual('La Roche-Posay');
    });

    it('Near match', async () => {
      const { agendas } = await svc({
        search: 'Roche-Posay',
      });

      expect(agendas[0].title).toEqual('La Roche-Posay');
    });

    it('match', async () => {
      const { agendas } = await svc({
        search: 'Roche',
      });

      expect(agendas[0].title).toEqual('La Roche-Posay');
    });

    it('With accents', async () => {
      const { agendas } = await svc({
        search: 'Théâtre',
      });

      expect(agendas[0].title).toEqual('Au Théâtre ce soir');
    });

    it('Singular can provide plural', async () => {
      const { agendas } = await svc({
        search: 'musée',
      });

      expect(agendas.length).toEqual(3);
    });

    it('With accents but unspecified in search', async () => {
      const { agendas } = await svc({
        search: 'Theatre',
      });

      expect(agendas[0].title).toEqual('Au Théâtre ce soir');
    });

    it('Accented and/or uppercased search give same results as non-accented and/or lowercased ones', async () => {
      const capsedSearchResults = await svc(
        {
          search: 'FINISTERE',
        },
        { size: 2 },
      ).then(({ agendas }) => agendas.map((a) => a.title));

      const accentedSearchResults = await svc(
        {
          search: 'finistère',
        },
        { size: 2 },
      ).then(({ agendas }) => agendas.map((a) => a.title));

      expect(capsedSearchResults).toEqual(accentedSearchResults);
    });
  });

  describe('Keywords', () => {
    it('matches on a keyword', async () => {
      const { agendas } = await svc.list({
        search: 'mcc',
      });

      expect(agendas[0].title).toEqual('Journées Européennes du Patrimoine');
    });
  });

  describe('Navigation', () => {
    it('after key is provided in result', async () => {
      const { after } = await svc({ search: 'musées' }, { size: 1 });
      expect(Array.isArray(after)).toBeTruthy();
    });

    it('after key is used to get next results', async () => {
      const { agendas } = await svc({ search: 'musées' }, { size: 2 });

      const result = await svc({ search: 'musées' }, { size: 1 });
      const secondResult = await svc(
        { search: 'musées' },
        {
          size: 1,
          after: result.after,
        },
      );

      expect(agendas[0].uid).toEqual(result.agendas[0].uid);
      expect(secondResult.agendas[0].uid).toEqual(agendas[1].uid);
    });

    it('after key provided as non-array is not valid', async () => {
      const { error } = await svc(
        { search: 'musées' },
        {
          size: 1,
          after: 3,
        },
      ).then(
        (r) => ({ result: r }),
        (e) => ({ error: e }),
      );

      expect(error.statusCode).toEqual(400);
      expect(error.message).toEqual('Provided after value is invalid');
    });
  });

  describe('Sorting', () => {
    it('An agenda with upcoming events is prioritized for a given search', async () => {
      const { agendas } = await svc({ search: 'musées' }, { size: 3 });

      expect(agendas.map((a) => a.title)).toEqual([
        'Nuit européenne des musées 2020 : Île-de-France',
        'Nuit européenne des musées 2018 : Île-de-France',
        'Nuit européenne des musées 2019 : Île-de-France',
      ]);
    });

    it('Official agendas are prioritized in a search', async () => {
      const { agendas } = await svc(
        { search: 'Rendez-vous aux jardins' },
        { size: 4 },
      );

      expect(agendas.map((i) => i.title)).toEqual([
        'Rendez-vous aux jardins : Pays de la Loire qui va bien', // officiel
        'Rendez-vous aux jardins', // pas officiel
        'Rendez-vous aux jardins : Pays de la Loire qui ne va pas', // pas officiel
        'Nuit européenne des musées 2019 : Île-de-France', // officiel
      ]);
    });

    it('Title search is more important than description which is more important than keywords', async () => {
      const { agendas } = await svc({
        search: 'cuillère',
      });

      expect(agendas.map((i) => i.title)).toEqual([
        'Cuillère à soupe',
        'Téléphone',
        'Froid estival',
      ]);
    });

    it('createdAt.desc sort', async () => {
      const { agendas } = await svc(
        {},
        {
          size: 3,
          sort: 'createdAt.desc',
        },
        { includeFields: 'createdAt' },
      );

      agendas.forEach((agenda, index) => {
        if (!index) return;
        expect(
          agendas[index].createdAt <= agendas[index - 1].createdAt,
        ).toBeTruthy();
      });
    });

    it('recentlyAddedEvents.desc sort', async () => {
      const { agendas } = await svc(
        {},
        {
          sort: 'recentlyAddedEvents.desc',
          size: 3,
        },
      );

      expect(agendas.map((i) => i.title)).toEqual([
        'Au Théâtre ce soir',
        'Froid estival',
        'Meudon',
      ]);
    });
  });

  describe('Structure', () => {
    it('detailed event count by state is given', async () => {
      const { agendas } = await svc(
        {
          search: 'Nuit européenne des musées 2018 : Île-de-France',
        },
        { size: 1 },
        { includeFields: 'summary', access: 'internal' },
      );

      expect(agendas[0].summary.eventCountsByState).toEqual([
        { eventCount: 20, key: -1 },
        { eventCount: 150, key: 1 },
        { eventCount: 389, key: 2 },
      ]);
    });
  });

  describe('options', () => {
    it('if agenda has no image, no image is returned by default', async () => {
      const { agendas } = await svc.list({ uid: 30166879 });

      expect(agendas[0].image).toBeUndefined();
    });

    it('if agenda has no image and useDefaultImage is true, default image is provided', async () => {
      const { agendas } = await svc.list(
        { uid: 30166879 },
        {},
        { useDefaultImage: true },
      );

      expect(agendas[0].image).toEqual(config.defaultImage);
    });

    it('if agenda has an image and includeImagePath is false, image path is removed', async () => {
      const { agendas } = await svc.list(
        { uid: 89904399 },
        {},
        { includeImagePath: false },
      );

      expect(agendas[0].image).toEqual('agenda89904399.jpg');
    });
  });

  describe('Filters', () => {
    it('fetch official only', async () => {
      const { agendas } = await svc.list({
        official: true,
      });

      agendas.forEach((agenda) => {
        expect(agenda.official).toEqual(true);
      });
    });

    it('fetch by uid', async () => {
      const uids = [4602853, 91785059];

      const { agendas } = await svc.list({
        uid: uids,
      });

      expect(agendas.map((i) => i.uid)).toEqual(uids);
    });

    it('fetch by slug', async () => {
      const slugs = ['ndm-2020-idf', 'ndm-2019-idf'];
      const { agendas } = await svc.list({
        slug: slugs,
      });

      expect(agendas.map((i) => i.slug)).toEqual(slugs);
    });

    it('fetch updated after a certain date', async () => {
      const { total } = await svc.list({
        updatedAt: { gte: JSON.stringify('2020-04-01') },
      });

      expect(total).toEqual(2);
    });

    it('query can be given with flat keys', async () => {
      const { total } = await svc.list({
        'updatedAt.gte': JSON.stringify('2020-04-01'),
      });

      expect(total).toEqual(2);
    });

    it('fetch for certain network only', async () => {
      const { agendas } = await svc.list(
        {
          network: 1,
        },
        { size: 1 },
        { includeFields: ['network'] },
      );

      expect(agendas.pop().network.uid).toEqual(1);
    });

    it('fetch for certain location set only', async () => {
      const { total, agendas } = await svc.list(
        {
          locationSet: 5675667,
        },
        {},
        { includeFields: 'locationSet' },
      );

      expect(agendas.pop().locationSet.uid).toEqual(5675667);
      expect(total).toEqual(3);
    });

    it('fetch agendas open & members only contribution types', async () => {
      const { agendas } = await svc.list(
        {
          contributionType: [0, 1],
        },
        {},
        { includeFields: 'settings' },
      );

      agendas.forEach((agenda) => {
        expect([0, 1].includes(agenda.settings.contribution.type)).toBeTruthy();
      });
    });
  });

  describe('Fixes and tweaks', () => {
    it('official should be indexed as boolean', async () => {
      const { agendas } = await svc({
        search: 'Lille',
      });

      expect(agendas.length).toEqual(1);
    });

    it('"Meudon" search puts "Meudon" official agenda first', async () => {
      const { agendas } = await svc({
        search: 'Meudon',
      });

      expect(agendas[0].title).toEqual('Meudon');
    });

    it('"meudon" search puts "Meudon" official agenda first', async () => {
      const { agendas } = await svc(
        {
          search: 'meudon',
        },
        { size: 1 },
      );

      expect(agendas[0].title).toEqual('Meudon');
    });
  });
});
