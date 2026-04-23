import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import IORedis from 'ioredis';
import Files from '@openagenda/files';
import testConfig from '../testconfig.js';

import Agendas from '../service/index.js';
import setup from './fixtures/setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { service: config, dependencies: dConfig } = testConfig;

describe('agendas - functional (server): set (update)', () => {
  let knex;
  let redisClient;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [
        `${__dirname}/fixtures/agenda.data.sql`,
        `${__dirname}/fixtures/agendaEvent.data.sql`,
      ],
    });

    redisClient = new IORedis(dConfig.redis);

    await redisClient.del('agendaSlugUnicity');
    await redisClient.del('agendaSlugUnicity:lock');

    svc = Agendas({
      ...config,
      knex,
      Files: Files(dConfig.files),
      redis: redisClient,
    });
  });

  afterAll(async () => {
    await redisClient.quit();
    await knex?.destroy();
  });

  it('set returns a promise', async () => {
    const { agenda } = await svc.set(4875, {
      title: 'La promesse',
    });

    expect(agenda.title).toBe('La promesse');
  });

  it('set in promise mode can take options', async () => {
    const { agenda } = await svc.set(
      4875,
      {
        title: 'La 2ème promesse',
      },
      { protected: false },
    );

    expect(agenda.title).toBe('La 2ème promesse');
  });

  it('set sets a pre-exisiting agenda if identifier is given as first parameter', async () => {
    const result = await svc.set(4875, {
      title: 'Le Frometon',
    });

    expect(result.agenda.title).toBe('Le Frometon');
  });

  it('set by slug works too', async () => {
    const result = await svc.set(
      {
        slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016',
      },
      {
        official: true,
      },
      { protected: false },
    );

    expect(result.agenda.official).toBe(1);
  });

  it('setting official timestamps offialized_at', async () => {
    const now = new Date();

    const result = await svc.set(
      4875,
      {
        official: true,
      },
      { protected: false, internal: true },
    );

    expect(result.agenda.officializedAt.getTime() - now.getTime()).toBeLessThan(
      1000,
    );
  });

  it('set without internal option returns an updated agenda that excludes internal fields', async () => {
    const result = await svc.set(4875, { title: 'Booyah' });

    expect(result.agenda.id).toBeUndefined();
  });

  it('set with internal option set to true returns an updated agenda that includes internal fields', async () => {
    const result = await svc.set(4875, { title: 'Boom.' }, { internal: true });

    expect(result.agenda.id).toBe(4875);
  });

  it('set with includeImagePath to true returns an updated agenda that includes image paths', async () => {
    const result = await svc.set(
      4875,
      { title: 'Le mur' },
      { includeImagePath: true },
    );

    expect(result.agenda.image).toBe(
      'https://cdn.openagenda.com/dev/review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg',
    );
  });

  it('set slug', async () => {
    const result = await svc.set(
      {
        slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016',
      },
      {
        slug: 'lait',
      },
    );

    expect(result.agenda.slug).toBe('lait');
  });

  it('set credentials on pre-exisiting agenda', async () => {
    const result = await svc.set(
      { uid: 65903437 },
      {
        credentials: {
          moderators: true,
        },
      },
      {
        internal: true, // to retrieve credentials after update
        protected: false,
      },
    );

    expect(result.agenda.credentials.moderators).toBe(true);
  });

  it('empty moderateOnChangeBy kept', async () => {
    const result = await svc.set(
      { uid: 35338076 },
      {
        settings: {
          contribution: {
            moderateOnChangeBy: [],
          },
        },
      },
      {
        internal: true, // to retrieve credentials after update
        protected: false,
      },
    );

    expect(result.agenda.settings.contribution.moderateOnChangeBy).toEqual([]);
  });

  it('public and admin settings can be patched up without affecting neighboring settings', async () => {
    await svc.set(
      { uid: 65903437 },
      {
        settings: {
          public: {
            filters: {
              displayed: ['keyword', 'search'],
            },
          },
        },
      },
    );

    const result = await svc.set(
      { uid: 65903437 },
      {
        settings: {
          public: {
            filters: {
              displayed: ['addMethod'],
            },
          },
        },
      },
    );

    expect(result.agenda.settings.public.filters.displayed).toEqual([
      'addMethod',
    ]);
  });

  it('unprotected set cannot update protected field', async () => {
    const uid = 65903437;

    await svc.set(
      { uid },
      {
        credentials: {
          moderators: true,
        },
      },
      { protected: false },
    );

    await svc.set(
      { uid },
      {
        title: 'Nouveau titre',
        credentials: {},
      },
    );

    const data = await svc.get({ uid }, { internal: true });

    expect(data.credentials.moderators).toBeTruthy();
  });

  it('partial settings set does not impact remaining settings values', async () => {
    const uid = 65903437;

    await svc.set(
      { uid },
      {
        settings: {
          public: {
            filters: {
              displayed: ['addMethod'],
            },
          },
        },
      },
    );

    const result = await svc.set(
      { uid },
      {
        settings: {
          contribution: {
            defaultState: 1,
          },
        },
      },
    );

    expect(result.agenda.settings.public.filters.displayed).toStrictEqual([
      'addMethod',
    ]);
  });

  it('default language can be set to albanese (sq)', async () => {
    const { agenda } = await svc.set(
      { uid: 65903437 },
      {
        settings: {
          contribution: {
            defaultLang: 'sq',
          },
        },
      },
    );

    expect(agenda.settings.contribution.defaultLang).toBe('sq');
  });

  it('admin settings are not lost with update', async () => {
    const { agenda } = await svc.set({ uid: 35338076 }, { title: 'Bah quoi' });

    expect(agenda.settings.admin).toEqual({
      filters: { displayed: ['keyword'] },
    });
  });

  it('admin location settings are not lost with update', async () => {
    const { agenda } = await svc.set({ uid: 90695263 }, { title: 'Bah quoi' });

    expect(agenda.settings.locations).not.toBeUndefined();
  });

  it('onUpdate callbacks with agenda data before and after update', async () => {
    svc = Agendas({
      ...config,
      Files: Files(dConfig.files),
      redis: redisClient,
      interfaces: {
        onUpdate: (before, after) => {
          expect(before.settings.contribution.useFields).toBe(false);
          expect(after.settings.contribution.useFields).toBe(true);
        },
      },
    });

    await svc.set(4830, {
      settings: {
        contribution: {
          useFields: true,
        },
      },
    });
  });

  it('onUpdate callbacks with agenda data that includes internal fields', async () => {
    svc = Agendas({
      ...config,
      Files: Files(dConfig.files),
      redis: redisClient,
      interfaces: {
        onUpdate: (before, after) => {
          expect(before.id).toBe(4830);
          expect(after.id).toBe(4830);
        },
      },
    });

    await svc.set(4830, {
      title: 'Blaaargh',
    });
  });
});
