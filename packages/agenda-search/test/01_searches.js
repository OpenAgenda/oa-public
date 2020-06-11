'use strict';

const _ = require('lodash');
const assert = require('assert');
const config = require('../testconfig');
const Service = require('../service');
const listInterface = require('./app/listInterface');

describe('search', function() {
  let svc;
  this.timeout(30000);

  before(() => {
    svc = Service({
      elasticsearch: config.elasticsearch,
      alias: config.alias,
      listAgendas: listInterface.bind(null, 100),
      imagePath: config.imagePath,
      defaultImage: config.defaultImage
    });
  });

  before(() => svc.rebuild());

  describe('Title', () => {

    it('Exact match', async () => {
      const { items } = await svc({
        search: 'La Roche-Posay'
      }, 0, 10);

      assert.equal(items[0].title, 'La Roche-Posay');
    });

    it('Near match', async () => {
      const { items } = await svc({
        search: 'Roche-Posay'
      }, 0, 10);

      assert.equal(items[0].title, 'La Roche-Posay');
    });

    it('match', async () => {
      const { items } = await svc({
        search: 'Roche'
      }, 0, 10);

      assert.equal(items[0].title, 'La Roche-Posay');
    });

    it('With accents', async () => {
      const { items } = await svc({
        search: 'Théâtre'
      }, 0, 10);

      assert.equal(items[0].title, 'Au Théâtre ce soir');
    });

    it('Singular can provide plural', async () => {
      const { items } = await svc({
        search: 'musée'
      });

      assert.equal(items.length, 3);
    });

    it('With accents but unspecified in search', async () => {
      const { items } = await svc({
        search: 'Theatre'
      }, 0, 10);

      assert.equal(items[0].title, 'Au Théâtre ce soir');
    });

  });

  describe('Keywords', () => {

    it('matchs on a keyword', async () => {
      const {
        items
      } = await svc.list({ search: 'mcc' }, 0, 10);

      assert.equal(items[0].title, 'Journées Européennes du Patrimoine');
    });

  });

  describe('Sorting', () => {

    it('An agenda with upcoming events is prioritized for a given search', async () => {
      const {
        items
      } = await svc({ search: 'musées' }, 0, 10);

      assert.deepEqual(items.map(a => a.title), [
        'Nuit européenne des musées 2020 : Île-de-France',
        'Nuit européenne des musées 2018 : Île-de-France',
        'Nuit européenne des musées 2019 : Île-de-France'
      ]);
    });

    it('Official agendas are prioritized in a search', async () => {
      const {
        items
      } = await svc({ search: 'Rendez-vous aux jardins' }, 0, 10);

      assert.deepEqual(items.map(i => i.title), [
        'Rendez-vous aux jardins : Pays de la Loire qui va bien', // officiel
        'Rendez-vous aux jardins', // pas officiel
        'Rendez-vous aux jardins : Pays de la Loire qui ne va pas', // pas officiel
        'Nuit européenne des musées 2019 : Île-de-France' // officiel
      ]);
    });

    it('Title search is more important than description which is more important than keywords', async () => {
      const {
        items
      } = await svc({ search: 'cuillère' }, 0, 10);

      assert.deepEqual(items.map(i => i.title), [
        'Cuillère à soupe',
        'Téléphone',
        'Froid estival'
      ]);
    });

  });

  describe('Misc', () => {

    it('fetch official only', async () => {
      const { total, items } = await svc.list({
        official: true
      }, 0, 10);

      items.forEach(agenda => {
        assert.equal(agenda.official, true);
      });
    });

  });

  describe('Fixes and tweaks', () => {

    it('official should be indexed as boolean', async () => {
      const { items } = await svc({
        search: 'Lille'
      }, 0, 20);

      assert.equal(items.length, 1);
    });

    it('"Meudon" search puts "Meudon" official agenda first', async () => {
      const { items } = await svc({
        search: 'Meudon'
      }, 0, 1);

      assert.equal(items[0].title, 'Meudon');
    });

    it('"meudon" search puts "Meudon" official agenda first', async () => {
      const { items } = await svc({
        search: 'meudon'
      }, 0, 1);

      assert.equal(items[0].title, 'Meudon');
    });

  });

});
