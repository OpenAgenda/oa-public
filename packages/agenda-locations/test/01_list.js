'use strict';

const assert = require('assert');

const config = require('../testconfig');
const fixtures = require('./fixtures/load');
const Service = require('../bisounours');

describe('agenda-locations - functional - list', () => {
  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: '//cibuldev.s3.amazonaws.com/',
      interfaces: {
        getAgendaIdByUid: async id => ({
          25221: 7196947
        })[id]
      }
    });
  });

  describe('defaults', () => {
    let items;

    before(async () => {
      items = await svc(7196947).list();
    });

    it('list paginates by 20', async () => {
      assert.equal(items.length, 20);
    });

    it('id is not provided', async () => {
      assert.equal(items[0].id, undefined);
    });

    it('order is by descending id', async () => {
      assert.deepEqual(items.map(i => i.slug), [
        'saint-paul-le-jeune',
        'st-andre-lachamp',
        'grotte-chauvet-2-ardeche327',
        '400-rue-de-vidalon-07430-davezieux',
        'parc-eolien-de-cros-de-georand',
        'grotte-saint-marcel',
        'hameau-de-massas',
        'mairie-darcens',
        'village-de-saint-martin-de-valamas',
        'domaine-marc-seguin-chapelle-de-varagnes',
        'mairie378',
        'mairie-villeneuve-de-berg139',
        'musee-des-sports',
        'place-olivier-de-serres',
        'devant-loffice-de-tourisme-le-teil',
        'colonie-de-vacances-de-saint-andre-en-vivarais',
        'les-ruches-saint-andre-en-vivarais',
        'salaisons-teyssier-saint-agreve',
        'la-chapelle-sous-rochepaule',
        'grange-de-claviere'
      ]);

    });
  });

  describe('search', () => {
    it('queries region field', async () => {
      const items = await svc(7196947).list({ search: 'nom de région' });

      assert.equal(items.length, 1);
      assert.equal(items[0].name, 'Abbatiale Sainte-Marie');
    });

    it('queries department field', async () => {
      const items = await svc(7196947).list({ search: 'nom de département' })

      assert.equal(items.length, 1);
      assert.equal(items[0].name, 'Abbatiale Sainte-Marie');
    });
  });

});
