import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import _ from 'lodash';
import Files from '@openagenda/files';
import IORedis from 'ioredis';
import testConfig from '../testconfig.js';
import Agendas from '../service/index.js';
import setup from './fixtures/setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { service: config, dependencies: dConfig } = testConfig;

describe('agendas - functional (server): set (create)', () => {
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
    await redisClient.del('agendaUidUnicity');
    await redisClient.del('agendaUidUnicity:lock');

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

  it('simplest create is with a title, a description and an owner', async () => {
    const result = await svc.set({
      ownerId: 12,
      title: 'Hello World',
      description: 'This is necessary',
    });

    expect(_.pick(result.agenda, ['slug', 'image', 'title'])).toEqual({
      slug: 'hello-world',
      image: null,
      title: 'Hello World',
    });

    expect(_.pick(result, ['valid', 'success', 'errors'])).toEqual({
      valid: true,
      success: true,
      errors: [],
    });
  });

  it('create works through a promise', async () => {
    const { agenda } = await svc.set({
      ownerId: 12,
      title: 'Hello World',
      description: 'This is necessary',
    });

    expect(agenda.title).toBe('Hello World');
  });

  it('title and description are mandatory', async () => {
    const result = await svc.set({ ownerId: 3 });

    expect(result.valid).toBe(false);

    expect(result.errors).toEqual([
      {
        field: 'title',
        code: 'required',
        message: 'a string is required',
        origin: undefined,
      },
      {
        field: 'description',
        code: 'required',
        message: 'a string is required',
        origin: undefined,
      },
      {
        field: 'slug',
        code: 'required',
        message: 'value must not be empty',
        origin: '',
      },
    ]);
  });

  it('set creates an agenda if no identifier is specified in first param', async () => {
    const result = await svc.set({
      ownerId: 1,
      title: 'Courbevoie',
      description: 'Que faire à Courbevoie',
      url: 'www.ville-courbevoie.fr/lagenda-de-vos-evenements.htm',
    });

    expect(_.pick(result.agenda, ['slug', 'title', 'description'])).toEqual({
      slug: 'courbevoie',
      title: 'Courbevoie',
      description: 'Que faire à Courbevoie',
    });
  });

  it('set in create mode excludes internal values if internal option is not specified or false', async () => {
    const result = await svc.set({
      ownerId: 1,
      title: 'Blob 123',
      description: "Evénements d'une rando en Espagne/France/Italie",
    });

    expect(result.agenda.id).toBeUndefined();
  });

  it('set agenda with long URL', async () => {
    const { agenda } = await svc.set({
      ownerId: 1,
      title: 'Long URL',
      description: 'Un événement avec un URL trop long',
      url: 'https://www.canva.com/design/DAE2i2QUhu4/-kEbAkNW3Xn499vYjfzYSg/view?utm_content=DAE2i2QUhu4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h72e9f938b9/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnxJrLMXSWzQY5TxRZdJfMO0bRvgQYy5ElYoc0Xmy4ccORR8XPiPuimP7KNWk&brid=2Gv9ZDUuV-ZJL5IyNLcENg',
    });

    expect(agenda.title).toBe('Long URL');
  });

  it('set agenda with URL too long', async () => {
    const { errors } = await svc.set({
      ownerId: 1,
      description: 'Woopdidoo',
      title: 'Too long',
      url: 'https://my.weazelent.com/journee-fenêtres-ouvertes-1991-campus-arts-et-metiers-de-chalons-en-champagne?_gl=1*mlk4lh*_gcl_au*MTU5ODY3OTUzNi4xNzYzMzY1NjY3LjY5MTk5NjQ0OC4xNzY1OTYzNzg4LjE3NjU5NjM5MDQ.*_ga*MTYyMjY5MzQ3Ni4xNzUxOTgzODUx*_ga_39H9VBFX7G*czE3NjU5NjM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzkgzODUx*_ga_39H9VBFX7G*czE3NjU5NjM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JgzODUx*_ga_39H9VBFX7G*czE3NjU5NjM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0J5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0*_ga*MTYyMjY5MzQ3Ni4xNzUxOTgzODUx*_ga_39H9VBFX7G*czE3NjU5NjM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiNjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzkgzODUNjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzkgzODU0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzkgzODUx*_ga_39H9VBFX7G*czE3NjU5NjM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JgzODUx*_ga_39H9VBFX7G*czE3NjU5NjM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0J5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0*_ga*MTYyMjY5MzQ3Ni4xNzUxOTgzODUx*_ga_39H9VBFX7G*czE3NjU5NjM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiNjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzkgzODUNjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzkgzODU0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzk5JGcxJHQxNzY1OTY1MjA0JGo1MiRsMCRoNDk4ODE0NjM0jM3ODYkbzkgzODUx*_ga_39H9VBFX7G*czE3',
    });

    expect(errors[0].code).toBe('link.toolong');
  });

  it('set in create mode calls onCreate callback with created agenda including internal values', async () => {
    svc = Agendas({
      ...config,
      Files: Files(dConfig.files),
      interfaces: {
        onCreate: (agenda) => {
          expect(agenda.title).toBe('Niargl');

          expect(agenda.id).not.toBeUndefined();
        },
      },
      redis: redisClient,
    });

    await svc.set({
      ownerId: 1,
      title: 'Niargl',
      description: 'Blotock',
    });
  });

  it('set in create mode returns internal values if internal option is true', async () => {
    const result = await svc.set(
      {
        ownerId: 1,
        title: 'Seconde guerre punique',
        description: "Evénements d'une rando en Espagne/France/Italie",
      },
      { internal: true },
    );

    expect(_.isObject(_.get(result, 'agenda.credentials'))).toBe(true);
  });

  it('slug is checked for unicity', async () => {
    const results = await Promise.all(
      ['Triplet 1', 'Triplet 2', 'Triplet 3'].map((title) =>
        svc.set({
          ownerId: 1,
          title,
          description: 'One of the triplets',
          slug: 'triplet',
        })),
    );

    expect(results.filter((r) => r.agenda === null).length).toBe(2);
    expect(results.filter(({ success }) => success === false).length).toBe(2);
    expect(
      results.find(({ success }) => success === false).errors,
    ).toStrictEqual([
      {
        field: 'slug',
        code: 'duplicate',
        message: 'duplicate value found',
        origin: 'triplet',
      },
    ]);
  });

  it('uid is generated and unique for created agendas', async () => {
    const result1 = await svc.set({
      ownerId: 1,
      title: 'Test UID 1',
      description: 'Testing UID generation',
    });

    const result2 = await svc.set({
      ownerId: 1,
      title: 'Test UID 2',
      description: 'Testing UID generation',
    });

    // Both should have UIDs
    expect(result1.agenda.uid).toBeTruthy();
    expect(result2.agenda.uid).toBeTruthy();

    // UIDs should be different
    expect(result1.agenda.uid).not.toBe(result2.agenda.uid);

    // UIDs should be numbers inferior to 10000000
    const uid1 = parseInt(result1.agenda.uid, 10);
    const uid2 = parseInt(result2.agenda.uid, 10);
    expect(uid1).toBeGreaterThanOrEqual(0);
    expect(uid1).toBeLessThan(10000000);
    expect(uid2).toBeGreaterThanOrEqual(0);
    expect(uid2).toBeLessThan(10000000);
  });
});
