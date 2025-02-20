'use strict';

const _ = require('lodash');
const Files = require('@openagenda/files');

const { service: config, dependencies: dConfig } = require('../testconfig');
const svc = require('../service/index');
const loadFixtures = require('./fixtures/load');

describe('agendas - functional (server): set (create)', () => {
  beforeAll(
    loadFixtures.bind(null, {
      mysql: config.mysql,
      files: [
        `${__dirname}/fixtures/resetDb.sql`,
        `${__dirname}/../model.sql`,
        `${__dirname}/fixtures/agenda.data.sql`,
        `${__dirname}/fixtures/agendaEvent.data.sql`,
      ],
      map: {
        database: config.mysql.database,
        agenda: 'agenda',
        agendaEvent: 'agenda_event',
      },
    }),
  );

  beforeAll(() =>
    svc.init({
      ...config,
      Files: Files(dConfig.files),
    }));

  afterEach(() =>
    svc.init({
      ...config,
      Files: Files(dConfig.files),
    }));

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

  it('set in create mode calls onCreate callback with created agenda including internal values', () =>
    new Promise((resolve, reject) => {
      svc.init({
        ...config,
        Files: Files(dConfig.files),
        interfaces: {
          onCreate: (agenda) => {
            expect(agenda.title).toBe('Niargl');

            expect(agenda.id).not.toBeUndefined();

            resolve();
          },
        },
      });

      svc
        .set(
          {
            ownerId: 1,
            title: 'Niargl',
            description: 'Blotock',
          },
          () => {},
        )
        .catch(reject);
    }));

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
});
