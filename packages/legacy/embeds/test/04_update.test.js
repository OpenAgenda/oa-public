'use strict';

const { produce } = require('immer');
const unserialize = require('locutus/php/var/unserialize');
const Service = require('../service');
const fixtures = require('./fixtures');
const payload = require('./fixtures/payload.json');


describe('04 - embeds - update', () => {
  let fx;
  let svc;

  beforeAll(async () => {
    fx = fixtures({
      database: 'embed_test',
      host: process.env.OA_MYSQL_TEST_HOST,
      user: process.env.OA_MYSQL_TEST_USER,
      password: process.env.OA_MYSQL_TEST_PASSWORD,
      ssl: true
    });

    await fx.load();

    svc = Service({
      knex: fx.client,
      interfaces: {
        getAgendaId: async () => 13262
      }
    });
  });

  afterAll(() => fx.destroyClient());

  describe('basic', () => {
    const linkcss = 'https://openagenda.com/link.css';
    let embed;

    beforeAll(async () => {
      embed = await svc(7894576).get(21898722);

      await svc(7894576).update(21898722, produce(embed, draft => {
        draft.config.layout.linkcss = linkcss;
      }));
    });

    it('updates', async () => {
      const updatedEmbed = await svc(7894576).get(21898722);

      expect(updatedEmbed.config.layout.linkcss).toBe(linkcss);
    });
  });

  describe('fix', () => {
    it('unserialize does not handle negative floats well. Coords are stored as strings', async () => {
      await svc(7894576).update(21898722, payload);

      const {
        store
      } = await fx.client('review_embed').first().where('uid', 21898722);

      expect(typeof unserialize(store).layout.mapCorners.neLat).toBe('string');
    });
  });
});
