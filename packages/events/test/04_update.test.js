import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createReadStream, createWriteStream } from 'node:fs';
import _ from 'lodash';
import Files from '@openagenda/files';

import { service as config, dependencies as dConfig } from '../testconfig.js';

import Service from '../index.js';
import setup from './fixtures/setup.js';
import creditsEventCreate from './fixtures/creditsEventCreate.json' with { type: 'json' };
import creditsEventUpdate from './fixtures/creditsEventUpdate.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const data = {
  title: { fr: "Spectacle de contes sur le thème de l'Afrique" },
  description: { fr: 'Une description courte' },
  timezone: 'Europe/Paris',
  attendanceMode: 1,
  locationUid: 47715652,
  timings: [
    {
      begin: '2020-12-09T10:00:00.000Z',
      end: '2020-12-09T12:00:00.000Z',
    },
  ],
  age: { min: undefined, max: undefined },
};

describe('events - functional - update', () => {
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
    });
  });

  afterAll(() => knex?.destroy());

  describe('simple update', () => {
    let updated;
    let entry;

    beforeAll(async () => {
      updated = await svc.update(41414062, data);
      entry = await knex('event_2').first().where('uid', updated.uid);
    });

    it('result is updated event', () => {
      expect(updated.title.fr).toBe(
        "Spectacle de contes sur le thème de l'Afrique",
      );
    });

    it('entry is updated in table', async () => {
      expect(entry.title).toBe(
        '{"fr":"Spectacle de contes sur le thème de l\'Afrique"}',
      );
    });
  });

  describe('simple patch', () => {
    let event;
    let patched;

    beforeAll(async () => {
      event = await svc.get({ slug: 'exposition-legypte-ancienne' });
      patched = await svc.patch(
        { slug: 'exposition-legypte-ancienne' },
        {
          title: {
            fr: 'Expo Egypte ancienne',
          },
        },
      );
    });

    it('result shows patched event', () => {
      expect(patched.title.fr).toBe('Expo Egypte ancienne');
    });

    it('fields other than updated remain unchanged', () => {
      expect(_.omit(patched, ['updatedAt', 'title'])).toEqual(
        _.omit(event, ['updatedAt', 'title']),
      );
    });
  });

  describe('other patches', () => {
    it('patch to remove location on online event', async () => {
      const patched = await svc.patch(
        { slug: 'musiques-electroniques-et-cinema' },
        {
          attendanceMode: 2,
          onlineAccessLink: 'https://oa.com',
          location: null,
        },
      );

      expect(patched.locationUid).toBeUndefined();
    });
    it('update extIds', async () => {
      const ev = await svc.create({
        ...creditsEventCreate,
        extIds: [{ key: 'oa', value: '123' }],
      });

      const updated = await svc.update(
        ev.uid,
        {
          extIds: [{ key: 'oa2', value: '456' }],
        },
        { mergeExtIds: false },
      );

      expect(updated.extIds).toStrictEqual([{ key: 'oa2', value: '456' }]);
    });

    it('update extIds with mergeExtIds', async () => {
      const ev = await svc.create({
        ...creditsEventCreate,
        extIds: [{ key: 'oa', value: '123' }],
      });

      const updated = await svc.update(ev.uid, {
        extIds: [{ key: 'oa2', value: '456' }],
      });

      expect(updated.extIds).toStrictEqual([
        { key: 'oa2', value: '456' },
        { key: 'oa', value: '123' },
      ]);
    });

    it('patch extIds', async () => {
      const ev = await svc.create({
        ...creditsEventCreate,
        extIds: [
          { key: 'oa', value: '123' },
          { key: 'oa2', value: '123' },
        ],
      });

      const patched = await svc.patch(ev.uid, {
        extIds: [{ key: 'oa2', value: '456' }],
      });

      expect(patched.extIds).toStrictEqual([
        { key: 'oa2', value: '456' },
        { key: 'oa', value: '123' },
      ]);
    });
  });

  describe('update with image', () => {
    let svc2;

    beforeAll(
      () =>
        new Promise((done) => {
          createReadStream(`${__dirname}/fixtures/images/dog.png`)
            .pipe(createWriteStream('/tmp/dog.png'))
            .on('close', done);
        }),
    );

    beforeAll(() => {
      svc2 = Service({
        knex,
        Files: Files(dConfig.files),
      });
    });

    it('image is uploaded', async () => {
      let error;
      const updated = await svc2.update(93469090, {
        ...data,
        image: createReadStream('/tmp/dog.png'),
      });

      try {
        await fetch(`${config.imagePath}${updated.image.filename}`).then(
          (r) => {
            if (!r.ok) throw new Error('Invalid status');
          },
        );
      } catch (e) {
        error = e;
      }

      expect(error).toBeUndefined();
    });

    it('image credits are updated', async () => {
      const event = await svc2.create(creditsEventCreate);
      const updated = await svc2.update(event.uid, creditsEventUpdate);

      expect(updated.imageCredits).toBe('Crédits à jour');
    });

    it('image credits are removed from image data when patch clears them from main field', async () => {
      const event = await svc2.create(creditsEventCreate);

      await svc2.update(
        event.uid,
        {
          imageCredits: 'updated credits',
        },
        {
          isPatch: true,
        },
      );

      await svc2.update(
        event.uid,
        {
          imageCredits: '',
        },
        {
          isPatch: true,
        },
      );

      expect(
        await knex('event_2')
          .first('image')
          .where('uid', event.uid)
          .then((r) => JSON.parse(r.image).credits),
      ).toBeNull();
    });
  });

  describe('interfaces', () => {
    const calls = [];

    beforeAll(async () => {
      svc = Service({
        knex,
        interfaces: {
          beforeUpdate: async (before, after, context) => {
            calls.push(['beforeUpdate', before, after, context]);
          },
          onUpdate: async (before, after, context) => {
            calls.push(['onUpdate', before, after, context]);
          },
          getOriginAgendas: (uids, options) => {
            calls.push(['getOriginAgendas', uids, options]);
          },
        },
      });

      await svc.update(93469090, data, {
        context: 'Update context',
        detailed: true,
        private: null,
      });
    });

    it('beforeUpdate was called', () => {
      expect(calls.find((c) => c[0] === 'beforeUpdate')).not.toBeUndefined();
    });

    it('onUpdate was called', () => {
      expect(calls.find((c) => c[0] === 'onUpdate')).not.toBeUndefined();
    });

    it('age in onUpdate is with values set to null', () => {
      expect(calls[1][2].age).toEqual({
        min: null,
        max: null,
      });
    });

    it('getOriginAgendas is called when detailed option is set', () => {
      expect(
        calls.filter((c) => c[0] === 'getOriginAgendas').length,
      ).toBeGreaterThan(0);
    });

    it('private option is passed as null to getOriginAgendas when specified as such in update call', () => {
      calls
        .filter((c) => c[0] === 'getOriginAgendas')
        .forEach((call) => {
          expect(call[2].private).toBeNull();
        });
    });
  });

  describe('other', () => {
    it('update of draft event', async () => {
      const draftEvent = await svc.create(
        {
          title: 'Un titre',
        },
        { draft: true },
      );

      const updatedDraftEvent = await svc.update(
        draftEvent.uid,
        {
          title: 'Un titre modifié',
        },
        { draft: true },
      );

      expect(updatedDraftEvent.title.en).toBe('Un titre modifié');
    });

    it('undrafting through patch', async () => {
      const draftEvent = await svc.create(
        {
          title: 'Un autre titre',
        },
        { draft: true },
      );

      expect(draftEvent.draft).toBe(true);

      const undraftedEvent = await svc.patch(draftEvent.uid, data, {
        draft: false,
      });

      expect(undraftedEvent.draft).toBe(false);

      const entry = await knex('event_2')
        .first('draft')
        .where('uid', draftEvent.uid);

      expect(entry.draft).toBe(0);
    });

    it('fix: patch from DHM format', async () => {
      await svc.patch(
        { slug: 'exposition-legypte-ancienne' },
        {
          timings: [
            {
              begin: {
                date: '2020-11-22',
                hours: 13,
                minutes: 0,
              },
              end: {
                date: '2020-11-22',
                hours: 13,
                minutes: 30,
              },
            },
          ],
        },
      );

      const entry = await knex('event_2')
        .first('timings')
        .where('slug', 'exposition-legypte-ancienne');

      expect(entry.timings).toBe(
        '[{"begin":"2020-11-22T13:00:00.000+01:00","end":"2020-11-22T13:30:00.000+01:00"}]',
      );
    });

    it('links can be patched', async () => {
      const result = await svc.patch(
        { slug: 'exposition-legypte-ancienne' },
        {
          links: [
            {
              link: 'https://fr.calameo.com/read/0000531373581dd606b95',
              data: {
                url: 'https://www.calameo.com/read/0000531373581dd606b95',
                type: 'rich',
                version: '1.0',
                title:
                  'Petites vacances scolaires 3/17 ans - Hiver / Printemps 2021',
                author: 'Ville de Roubaix',
                author_url: 'https://www.calameo.com/accounts/53137',
                provider_name: 'calameo.com',
                description:
                  "petites vacances scolaires ACCUEILS DE LOISIRS 3/17 ANS Dates d'ouverture des centres Vacances d'Hiver : du 22 février au 5 mars HIVER 2021 Vacances de Printemps : du 26 avril au 7 PRINTEMPS mai 2021 Dates limites d'inscription : 2021 13...",
                thumbnail_url:
                  'https://p.calameoassets.com/210114155242-fc5ad8a39a0af2fd840cadbfe988b11d/p1.jpg',
                thumbnail_width: 1125,
                thumbnail_height: 1596,
                html: '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 71.0024%;"><iframe src="//v.calameo.com/?bkcode=0000531373581dd606b95" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no" allow="encrypted-media"></iframe></div>',
                cache_age: 86400,
              },
              type: 'oembed',
            },
          ],
        },
      );

      expect(result.links.length).toBe(1);
    });

    it('ownerUid can be patched when in unprotected mode only', async () => {
      const protectedPatch = await svc.patch(
        { uid: 16687899 },
        {
          ownerUid: 99999999,
        },
        {
          access: 'internal',
        },
      );

      expect(protectedPatch.ownerUid).toBe(96815475);

      const unprotectedPatched = await svc.patch(
        { uid: 16687899 },
        {
          ownerUid: 99999999,
        },
        {
          protected: false,
          access: 'internal',
        },
      );

      expect(unprotectedPatched.ownerUid).toBe(99999999);
    });

    it('age provided as empty object is cleaned to { min: null, max: null }', async () => {
      const { age } = await svc.patch(
        { slug: 'exposition-legypte-ancienne' },
        {
          age: {},
        },
      );
      expect(age).toEqual({ min: null, max: null });
    });
  });
});
