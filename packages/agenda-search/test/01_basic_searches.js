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
