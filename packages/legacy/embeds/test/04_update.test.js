'use strict';

const { produce } = require('immer');
const Service = require('../service');
const fixtures = require('./fixtures');

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
});
