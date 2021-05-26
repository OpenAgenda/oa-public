'use strict';

const Service = require('../service');
const fixtures = require('./fixtures');

describe('03 - embeds - create', () => {
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
        getAgendaId: async uid => Math.ceil(uid / 2)
      }
    });
  });

  afterAll(() => fx.destroyClient());

  describe('basic', () => {
    let createdEmbed;
    beforeAll(async () => {
      createdEmbed = await svc(7807073).create(); // only defaults
    });

    it('is created', async () => {
      expect(await fx
        .client('review_embed')
        .first()
        .where('uid', createdEmbed.uid))
        .toBeTruthy();
    });

    it('has default config', async () => {
      const embed = await svc(7807073).get(createdEmbed.uid);
      expect(embed.config.layout.lang).toBe('en');
    });
  });
});
