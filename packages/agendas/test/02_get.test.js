'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const Files = require('@openagenda/files');
const svc = require('../service/index');
const { service: config, dependencies: dConfig } = require('../testconfig');
const loadFixtures = require('./fixtures/load');

describe('agendas - functional (server): get', () => {
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

  beforeAll(() => {
    svc.init({
      ...config,
      Files: Files(dConfig.files),
    });
  });

  it('get works on promise', async () => {
    const agenda = await svc.get(4875);

    expect(_.pick(agenda, ['slug', 'uid', 'title'])).toEqual({
      slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016',
      uid: 52084961,
      title:
        'Programme des animations du Salon du Fromage et des Produits Laitiers 2016',
    });
  });

  it('get gets an agenda by id', async () => {
    const agenda = await svc.get(4875);

    expect(_.pick(agenda, ['slug', 'uid', 'title'])).toEqual({
      slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016',
      uid: 52084961,
      title:
        'Programme des animations du Salon du Fromage et des Produits Laitiers 2016',
    });
  });

  it('internal get returns memberSchemaId', async () => {
    const agenda = await svc.get(4875, { internal: true });

    expect(_.pick(agenda, ['memberSchemaId'])).toEqual({
      memberSchemaId: null,
    });
  });

  it('find one agenda by title', async () => {
    const agenda = await svc.findOne('Produits Laitiers');

    expect(agenda.uid).toBe(52084961);
  });

  it('get with includeImagePath option to true, gets the agenda with image path', async () => {
    const agenda = await svc.get(4875, { includeImagePath: true });

    expect(agenda.image).toBe(
      `${config.imagePath}review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg`,
    );
  });

  it('get gets an agenda by slug', async () => {
    const agenda = await svc.get({ slug: 'epn-espace-torcy' });

    expect(_.pick(agenda, ['slug', 'uid', 'title'])).toEqual({
      slug: 'epn-espace-torcy',
      uid: 94345899,
      title: 'EPN "Espace Torcy"',
    });
  });

  it('get with unspecified "private" option cannot get private agenda', async () => {
    const agenda = await svc.get({ slug: 'agenda-culture-gradignan' });

    expect(agenda).toBeNull();
  });

  it('get with nulled "private" option gets private agenda', async () => {
    const agenda = await svc.get(
      { slug: 'agenda-culture-gradignan' },
      { private: null },
    );

    expect(agenda.slug).toBe('agenda-culture-gradignan');
  });

  it('get with truthy "private" option gets private agenda', async () => {
    const agenda = await svc.get(
      { slug: 'agenda-culture-gradignan' },
      { private: true },
    );

    expect(agenda.slug).toBe('agenda-culture-gradignan');
  });

  it('standard get does not include credentials', async () => {
    const agenda = await svc.get({ uid: 94345899 });

    expect(_.get(agenda, 'credentials')).toBeUndefined();
  });

  it('get with internal option gets internal data like credentials and id', async () => {
    const agenda = await svc.get({ uid: 94345899 }, { internal: true });

    expect(_.get(agenda, 'credentials')).toEqual({
      premiumCustomFields: false,
      activatingInvitations: false,
      moderators: false,
      aggregator: false,
      invitationMessage: false,
      keepActivities: false,
      docxExport: false,
      eventOwnershipTransfer: false,
      memberCustom: false,
      showTotals: false,
    });
  });

  it('get with administrator option gets administrator-accessible data like the settings admin key', async () => {
    const agenda = await svc.get(
      { uid: 35338076 },
      {
        access: 'administrator',
      },
    );

    expect(agenda.settings.admin.filters.displayed).toEqual(['keyword']);
  });

  it('get location settings', async () => {
    const agenda = await svc.get({ uid: 90695263 });
    expect(agenda.settings.locations).toEqual({
      extIds: [
        {
          key: 'default',
          label: 'BDL',
          actions: {
            edit: {
              link: 'https://basedeslieux.culture.gouv.fr/lieux/{value}',
            },
          },
        },
      ],
    });
  });

  it('a few gets do not leak db connections', async () => {
    let remaining = 400;

    while (remaining > 0) {
      await svc.get({ uid: 94345899 });
      remaining -= 1;
    }

    expect(remaining).toEqual(0);
  });
});
