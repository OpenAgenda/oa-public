'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');

const async = require('async');
const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample.js');
const svc = require('../service/index.js');

describe('agendas - functional (server): get', () => {
  beforeAll(
    require('./fixtures/load.js').bind(null, {
      mysql: config.mysql,
      files: [
        `${__dirname}/fixtures/resetDb.sql`,
        `${__dirname}/../model.sql`,
        `${__dirname}/fixtures/agenda.data.sql`,
        `${__dirname}/fixtures/agendaEvent.data.sql`,
        `${__dirname}/fixtures/occurrence.data.sql`,
      ],
      map: {
        database: config.mysql.database,
        agenda: 'agenda',
        agendaEvent: 'agenda_event',
        occurrence: 'occurrence',
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

  it('get gets an agenda by id', (done) => {
    svc.get(4875, (err, agenda) => {
      expect(err).toBeNull();

      expect(_.pick(agenda, ['slug', 'uid', 'title'])).toEqual({
        slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016',
        uid: 52084961,
        title:
          'Programme des animations du Salon du Fromage et des Produits Laitiers 2016',
      });

      done();
    });
  });

  it('internal get returns memberSchemaId', (done) => {
    svc.get(4875, { internal: true }, (err, agenda) => {
      expect(err).toBeNull();

      expect(_.pick(agenda, ['memberSchemaId'])).toEqual({
        memberSchemaId: null,
      });

      done();
    });
  });

  it('find one agenda by title', (done) => {
    svc.findOne('Produits Laitiers', (err, agenda) => {
      expect(err).toBeNull();

      expect(agenda.uid).toBe(52084961);

      done();
    });
  });

  it('get with includeImagePath option to true, gets the agenda with image path', (done) => {
    svc.get(4875, { includeImagePath: true }, (err, agenda) => {
      expect(agenda.image).toBe(
        `${config.imagePath}review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg`,
      );

      done();
    });
  });

  it('get gets an agenda with details', (done) => {
    svc.get(4848, { detailed: true }, (err, agenda) => {
      expect(err).toBeNull();

      expect(agenda.publishedEvents).toBe(10);
      expect(agenda.upcomingPublishedEvents).toBe(8);

      done();
    });
  });

  it('get gets an agenda with restricted details', (done) => {
    svc.get(
      4848,
      { detailed: true, includeRestricted: true },
      (err, agenda) => {
        expect(agenda.totalEvents).toBe(19);

        done();
      },
    );
  });

  it('get gets an agenda by slug', (done) => {
    svc.get({ slug: 'epn-espace-torcy' }, (err, agenda) => {
      expect(err).toBeNull();

      expect(_.pick(agenda, ['slug', 'uid', 'title'])).toEqual({
        slug: 'epn-espace-torcy',
        uid: 94345899,
        title: 'EPN "Espace Torcy"',
      });

      done();
    });
  });

  it('get with unspecified "private" option cannot get private agenda', (done) => {
    svc.get({ slug: 'agenda-culture-gradignan' }, (err, agenda) => {
      expect(err).toBeNull();
      expect(agenda).toBeNull();

      done();
    });
  });

  it('get with nulled "private" option gets private agenda', (done) => {
    svc.get(
      { slug: 'agenda-culture-gradignan' },
      { private: null },
      (err, agenda) => {
        expect(agenda.slug).toBe('agenda-culture-gradignan');

        done();
      },
    );
  });

  it('get with truthy "private" option gets private agenda', (done) => {
    svc.get(
      { slug: 'agenda-culture-gradignan' },
      { private: true },
      (err, agenda) => {
        expect(agenda.slug).toBe('agenda-culture-gradignan');

        done();
      },
    );
  });

  it('standard get does not include credentials', (done) => {
    svc.get({ uid: 94345899 }, (err, agenda) => {
      expect(_.get(agenda, 'credentials')).toBeUndefined();

      done();
    });
  });

  it('get with internal option gets internal data like credentials and id', (done) => {
    svc.get({ uid: 94345899 }, { internal: true }, (err, agenda) => {
      expect(err).toBeNull();

      expect(_.get(agenda, 'credentials')).toEqual({
        useContributeApp: true,
        premiumCustomFields: false,
        activatingInvitations: false,
        embedsHead: true,
        embedsTemplates: true,
        moderators: false,
        aggregator: false,
        prioritizedAggregator: false,
        invitationMessage: false,
        docxExport: false,
        eventOwnershipTransfer: false,
        useJSONBridge: false,
        memberCustom: false,
      });

      done();
    });
  });

  it('get with administrator option gets administrator-accessible data like the settings admin key', async () => {
    const agenda = await svc.get(
      { uid: 35338076 },
      {
        access: 'administrator',
        detailed: true,
      },
    );

    expect(agenda.settings.admin.filters.displayed).toEqual(['keyword']);
  });

  it('a few gets do not leak db connections', (done) => {
    let remaining = 400;

    async.whilst(
      () => remaining,
      (wcb) => {
        svc.get({ uid: 94345899 }, (err, agenda) => {
          remaining--;

          wcb(err);
        });
      },
      (err) => {
        expect(remaining).toBe(0);

        expect(err).toBeNull();

        done();
      },
    );
  });
});
