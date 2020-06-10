'use strict';

const _ = require('lodash');
const should = require('should');
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

      items[0].title.should.equal('La Roche-Posay');
    });

    it('Near match', async () => {
      const { items } = await svc({
        search: 'Roche-Posay'
      }, 0, 10);

      items[0].title.should.equal('La Roche-Posay');
    });

    it('match', async () => {
      const { items } = await svc({
        search: 'Roche'
      }, 0, 10);

      items[0].title.should.equal('La Roche-Posay');
    });

    it('With accents', async () => {
      const { items } = await svc({
        search: 'Théâtre'
      }, 0, 10);

      items[0].title.should.equal('Au Théâtre ce soir');
    });

    it('Singular can provide plural', async () => {
      const { items } = await svc({
        search: 'musée'
      });

      items.length.should.equal(3);
    });

    it('With accents but unspecified in search', async () => {
      const { items } = await svc({
        search: 'Theatre'
      }, 0, 10);

      items[0].title.should.equal('Au Théâtre ce soir');
    });

  });

  describe('Keywords', () => {

    it('matchs on a keyword', async () => {
      const {
        items
      } = await svc.list({ search: 'mcc' }, 0, 10);

      items[0].title.should.equal('Journées Européennes du Patrimoine');
    });

  });

  describe('Sorting', () => {

    it('An agenda with upcoming events is prioritized for a given search', async () => {
      const {
        items
      } = await svc({ search: 'musées' }, 0, 10);

      items.map(a => a.title).should.eql([
        'Nuit européenne des musées 2020 : Île-de-France',
        'Nuit européenne des musées 2018 : Île-de-France',
        'Nuit européenne des musées 2019 : Île-de-France'
      ]);
    });

    it('Official agendas are prioritized in a search', async () => {
      const {
        items
      } = await svc({ search: 'Rendez-vous aux jardins' }, 0, 10);

      items.map(i => i.title).should.eql([
        'Rendez-vous aux jardins : Pays de la Loire qui va bien',
        'Rendez-vous aux jardins : Pays de la Loire qui ne va pas',
        'Rendez-vous aux jardins'
      ]);
    });

  });

  describe('Misc', () => {

    it('fetch official only', async () => {
      const { total, items } = await svc.list({
        official: true
      }, 0, 10);

      items.forEach(agenda => {
        agenda.official.should.equal(true);
      });
    });

  });

});
