import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { service as config } from '../testconfig.js';

import Service from '../index.js';
import fields from '../lib/fields.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('events - functional - list', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: { eventService: config.schema },
      data: [`${__dirname}/fixtures/event.data.sql`],
    });

    svc = Service({
      knex,
      imagePath: config.imagePath,
      defaultImage: '//default/image/path.png',
    });
  });

  afterAll(() => knex?.destroy());

  describe('simple list', () => {
    let events;

    beforeAll(async () => {
      events = await svc.list();
    });

    it('lists 20 items by default', () => {
      expect(events.length).toBe(20);
    });
  });

  describe('filters', () => {
    it('by locationUid', async () => {
      const { total } = await svc.list(
        { locationUid: 46457931 },
        {},
        { total: true },
      );

      expect(total).toBe(6);
    });

    it('by mutliple locationUids', async () => {
      const { total } = await svc.list(
        { locationUid: [46457931, 36223087] },
        {},
        { total: true },
      );

      expect(total).toBe(9);
    });

    it('by ownerUid', async () => {
      const { total } = await svc.list(
        { ownerUid: 96815475 },
        {},
        { total: true },
      );

      expect(total).toBe(247);
    });

    it('by search', async () => {
      const { total } = await svc.list(
        { search: 'Salon' },
        {},
        { total: true },
      );

      expect(total).toBe(10);
    });

    it('by createdAt', async () => {
      const { total } = await svc.list(
        { createdAt: { gte: '2020-09-10' } },
        {},
        { total: true },
      );

      expect(total).toBe(19);
    });

    it('extIds', async () => {
      const eventsWithExt = await svc.list(
        { uid: 91258823 },
        {
          limit: 1,
        },
      );
      expect(eventsWithExt[0].extIds).toEqual([
        { key: 'test', value: '12122SSA' },
      ]);
    });
  });

  describe('navigation', () => {
    it('with after and limit', async () => {
      const events = await svc.list({}, { limit: 10 });

      const { after } = await svc.list(
        {},
        { after: 0, limit: 5 },
        {
          useAfter: true,
        },
      );

      const { items } = await svc.list(
        {},
        { after, limit: 5 },
        {
          useAfter: true,
        },
      );

      expect(items[0].uid).toBe(events[5].uid);
    });

    it('order by updatedAt.desc', async () => {
      const events = await svc.list({}, { limit: 10, order: 'updatedAt.desc' });

      expect(
        events.every(
          (event, i, arr) => i === 0 || arr[i - 1].updatedAt > event.updatedAt,
        ),
      ).toBe(true);
    });
  });

  describe('options', () => {
    it('events marked as deleted do not show in list results', async () => {
      const events = await svc.list(
        { uid: 46091044 },
        {
          limit: 1,
        },
      );

      expect(events.length).toBe(0);
    });

    it('includeFields', async () => {
      const events = await svc.list(
        {},
        {
          limit: 1,
        },
        {
          includeFields: ['uid', 'title'],
        },
      );

      expect(Object.keys(events[0])).toEqual(['uid', 'title']);
    });

    it('useDefaultImage', async () => {
      const events = await svc.list(
        { uid: 15822724 },
        { limit: 1 },
        {
          useDefaultImage: true,
          includeFields: ['slug', 'image'],
        },
      );

      expect(events[0].image).toEqual({
        filename: 'path.png',
        base: '//default/image/',
      });
    });

    it('imageAsLink', async () => {
      const events = await svc.list(
        { uid: 15822724 },
        { limit: 1 },
        {
          useDefaultImage: true,
          imageAsLink: true,
          includeFields: ['slug', 'image'],
        },
      );

      expect(events[0].image).toBe('//default/image/path.png');
    });

    it('image path is placed in base key of image field', async () => {
      const events = await svc.list({}, { limit: 1 });

      expect(typeof events[0].image.base).toBe('string');
    });

    it('total true returns total in result, events in items key', async () => {
      const { items, total } = await svc.list(
        {},
        {},
        { total: true, draft: null },
      );

      expect(total).toBe(662);
      expect(items.length).toBe(20);
    });

    it('draft true returns draft events only', async () => {
      const { total } = await svc.list({}, {}, { total: true, draft: true });

      expect(total).toBe(4);
    });

    it('lang option flatten multilingual fields', async () => {
      const event = await svc
        .list(
          { uid: 80378817 },
          {},
          {
            lang: 'fr',
            html: true,
          },
        )
        .then((r) => r.pop());

      ['title', 'description', 'longDescription', 'html'].forEach((f1) => {
        expect(typeof event[f1]).toBe('string');
      });
    });

    it('if interfaces are set and detailed is true, events are decorated with location and origin agenda details', async () => {
      const location = {
        uid: 51971567,
        name: 'Associated location',
      };

      const agenda = {
        uid: 89904399,
        title: 'Origin agenda',
      };

      const svc1 = Service({
        knex,
        interfaces: {
          getOriginAgendas: async (_identifiers, _options) => [agenda],
          getLocations: async (_identifiers) => [location],
        },
      });

      const events = await svc1.list({}, { limit: 1 }, { detailed: true });

      expect(events[0].location.uid).toBe(location.uid);
      expect(events[0].agenda.uid).toBe(agenda.uid);
    });

    it('if html option is used, html variant of longDescription is placed in html field', async () => {
      const events = await svc.list({}, { limit: 1 }, { html: true });

      expect(events[0].html.fr).toBe(
        '<p>Swift, Jonathan de son prénom. Ce nom vous dit quelque chose ? Bingo ! C’est bien l’auteur du livre Les voyages de Gulliver, écrit au début du XVIIIe siècle.L’histoire d’un marin échouant sur l’île de Lilliput. Par la magie d’un colossal changement d’échelle, il se transforme subitement en géant, capturé par des êtres pas plus hauts que 6 pouces. Transposées dans le monde actuel, les images de ce théâtre d’ombres et d’objets se combinent à la vidéo, pour une expédition merveilleuse où l’immense rejoint le minuscule.</p>\n<p><em>Atelier enfants-adultes "Mon ombre est un autre" :15 h, sur réservation Goûter et surprise : 16 h, 8 €</em></p>\n',
      );
    });

    it('if access is internal, internal fields are returned', async () => {
      const internalFieldNames = fields
        .filter((f1) => f1.read.includes('internal'))
        .map((f1) => f1.field);

      const event = await svc
        .list(
          {},
          {
            limit: 1,
          },
          {
            access: 'internal',
          },
        )
        .then((r) => r[0]);

      internalFieldNames.forEach((field) => {
        expect(event).toHaveProperty(field);
      });
    });
  });
});
