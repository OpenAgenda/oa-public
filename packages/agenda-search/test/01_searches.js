'use strict';

const _ = require('lodash');
const assert = require('assert');
const config = require('./config');
const Service = require('../service');
const listInterface = require('./app/listInterface');
const getDetailedAgenda = require('./app/getDetailedAgenda');

describe('01 - Search', function() {
  let svc;
  this.timeout(30000);

  before(() => {
    svc = Service({
      elasticsearch: config.elasticsearch,
      alias: config.alias,
      defaultImage: config.defaultImage,
      listAgendas: listInterface('test', 100),
      getDetailedAgenda: getDetailedAgenda('test', a => {
        if (a.uid === 3) {
          a.updatedAt = new Date;
        }
        return a;
      })
    });
  });

  before(() => svc.rebuild());

  describe('Default (no searches, no filters, no options)', () => {
    let result;

    before(async () => {
      result = await svc({});
    });

    it('updated recently appears first', () => {
      assert.equal(result.agendas[0].uid, 3);
    });

    it('returns fields are limited to basic list', () => {
      const fields = Object.keys(result.agendas[0]);
      assert(fields.includes('uid'));
      assert(!fields.includes('summary'));
    });
  });

  describe('Title', () => {

    it('Exact match', async () => {
      const { agendas } = await svc({
        search: 'La Roche-Posay'
      });

      assert.equal(agendas[0].title, 'La Roche-Posay');
    });

    it('Near match', async () => {
      const { agendas } = await svc({
        search: 'Roche-Posay'
      });

      assert.equal(agendas[0].title, 'La Roche-Posay');
    });

    it('match', async () => {
      const { agendas } = await svc({
        search: 'Roche'
      });

      assert.equal(agendas[0].title, 'La Roche-Posay');
    });

    it('With accents', async () => {
      const { agendas } = await svc({
        search: 'Théâtre'
      });

      assert.equal(agendas[0].title, 'Au Théâtre ce soir');
    });

    it('Singular can provide plural', async () => {
      const { agendas } = await svc({
        search: 'musée'
      });

      assert.equal(agendas.length, 3);
    });

    it('With accents but unspecified in search', async () => {
      const { agendas } = await svc({
        search: 'Theatre'
      });

      assert.equal(agendas[0].title, 'Au Théâtre ce soir');
    });

  });

  describe('Keywords', () => {

    it('matches on a keyword', async () => {
      const {
        agendas
      } = await svc.list({
        search: 'mcc'
      });

      assert.equal(agendas[0].title, 'Journées Européennes du Patrimoine');
    });

  });

  describe('Navigation', () => {
    it('after key is provided in result', async () => {
      const { after } = await svc({ search: 'musées' }, { size: 1 });
      assert(Array.isArray(after));
    });

    it('after key is used to get next results', async () => {
      const { agendas } = await svc({ search: 'musées' }, { size: 2 });

      const result = await svc({ search: 'musées' }, { size: 1 });
      const secondResult = await svc({ search: 'musées' }, {
        size: 1,
        after: result.after
      });

      assert.equal(agendas[0].uid, result.agendas[0].uid);
      assert.equal(secondResult.agendas[0].uid, agendas[1].uid);
    });

    it('after key provided as non-array is not valid', async () => {
      const {
        error,
        response,
      } = await svc({ search: 'musées' }, {
        size: 1,
        after: 3
      }).then(r => ({ result: r }), e => ({ error: e }));

      assert.equal(error.statusCode, 400);
      assert.equal(error.message, 'Provided after value is invalid');
    });
  });

  describe('Sorting', () => {
    it('An agenda with upcoming events is prioritized for a given search', async () => {
      const {
        agendas
      } = await svc({ search: 'musées' }, { size: 3 });

      assert.deepEqual(agendas.map(a => a.title), [
        'Nuit européenne des musées 2020 : Île-de-France',
        'Nuit européenne des musées 2018 : Île-de-France',
        'Nuit européenne des musées 2019 : Île-de-France'
      ]);
    });

    it('Official agendas are prioritized in a search', async () => {
      const {
        agendas
      } = await svc({ search: 'Rendez-vous aux jardins' }, { size: 4 });

      assert.deepEqual(agendas.map(i => i.title), [
        'Rendez-vous aux jardins : Pays de la Loire qui va bien', // officiel
        'Rendez-vous aux jardins', // pas officiel
        'Rendez-vous aux jardins : Pays de la Loire qui ne va pas', // pas officiel
        'Nuit européenne des musées 2019 : Île-de-France' // officiel
      ]);
    });

    it('Title search is more important than description which is more important than keywords', async () => {
      const {
        agendas
      } = await svc({
        search: 'cuillère'
      });

      assert.deepEqual(agendas.map(i => i.title), [
        'Cuillère à soupe',
        'Téléphone',
        'Froid estival'
      ], {
        size: 3
      });
    });

    it('createdAt.desc sort', async () => {
      const {
        agendas
      } = await svc({}, {
        size: 3,
        sort: 'createdAt.desc'
      }, { includeFields: 'createdAt' });

      agendas.forEach((agenda, index) => {
        if (!index) return;
        assert(agendas[index].createdAt <= agendas[index -1].createdAt);
      });
    });

    it('recentlyAddedEvents.desc sort', async () => {
      const {
        agendas
      } = await svc({}, {
        sort: 'recentlyAddedEvents.desc',
        size: 3
      });

      assert.deepEqual(agendas.map(i => i.title), [
        'Au Théâtre ce soir',
        'Froid estival',
        'Meudon'
      ]);
    });
  });

  describe('Structure', () => {

    it('detailed event count by state is given', async () => {
      const {
        agendas
      } = await svc({
        search: 'Nuit européenne des musées 2018 : Île-de-France'
      }, { size: 1 }, { includeFields: 'summary', access: 'internal' });

      assert.deepEqual(agendas[0].summary.eventCountsByState, [
        { eventCount: 20, key: -1 },
        { eventCount: 150, key: 1 },
        { eventCount: 389, key: 2 }
      ]);
    });

  });

  describe('options', () => {
    it('if agenda has no image, no image is returned by default', async () => {
      const { agendas } = await svc.list({ uid: 30166879 });

      assert.equal(agendas[0].image, null);
    });

    it('if agenda has no image and useDefaultImage is true, default image is provided', async () => {
      const { agendas } = await svc.list({ uid: 30166879 }, {}, { useDefaultImage: true });

      assert.equal(agendas[0].image, config.defaultImage);
    });
  });

  describe('Filters', () => {

    it('fetch official only', async () => {
      const { agendas } = await svc.list({
        official: true
      });

      agendas.forEach(agenda => {
        assert.equal(agenda.official, true);
      });
    });

    it('fetch by uid', async () => {
      const uids = [4602853, 91785059];

      const { agendas } = await svc.list({
        uid: uids
      });

      assert.deepEqual(agendas.map(i => i.uid), uids);
    });

    it('fetch by slug', async () => {
      const slugs = ['ndm-2020-idf', 'ndm-2019-idf'];
      const {
        agendas
      } = await svc.list({
        slug: slugs
      });

      assert.deepEqual(agendas.map(i => i.slug), slugs);
    });

    it('fetch updated after a certain date', async () => {
      const { total } = await svc.list({
        updatedAt: { gte: JSON.stringify('2020-04-01') },
      });

      assert.equal(total, 2);
    });

    it('query can be given with flat keys', async () => {
      const { total } = await svc.list({
        'updatedAt.gte': JSON.stringify('2020-04-01')
      });

      assert.equal(total, 2);
    });

    it('fetch for certain network only', async () => {
      const { agendas } = await svc.list({
        network: 1
      }, { size: 1 }, { includeFields: ['network']});

      assert.equal(agendas.pop().network.uid, 1);
    });

    it('fetch for certain location set only', async () => {
      const { total, agendas } = await svc.list({
        locationSet: 5675667
      }, {}, { includeFields: 'locationSet' });

      assert.equal(agendas.pop().locationSet.uid, 5675667);
      assert.equal(total, 3);
    });

    it('fetch agendas open & members only contribution types', async () => {
      const { agendas } = await svc.list({
        contributionType: [0, 1]
      }, {}, { includeFields: 'settings' });

      agendas.forEach(agenda => {
        assert([0, 1].includes(agenda.settings.contribution.type));
      });
    });

  });

  describe('Fixes and tweaks', () => {

    it('official should be indexed as boolean', async () => {
      const { agendas } = await svc({
        search: 'Lille'
      });

      assert.equal(agendas.length, 1);
    });

    it('"Meudon" search puts "Meudon" official agenda first', async () => {
      const { agendas } = await svc({
        search: 'Meudon'
      });

      assert.equal(agendas[0].title, 'Meudon');
    });

    it('"meudon" search puts "Meudon" official agenda first', async () => {
      const { agendas } = await svc({
        search: 'meudon'
      }, { size: 1 });

      assert.equal(agendas[0].title, 'Meudon');
    });

  });

});
