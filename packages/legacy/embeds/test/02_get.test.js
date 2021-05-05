'use strict';

const Service = require('..');
const fixtures = require('./fixtures');

describe('02 - embeds - get', () => {
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
      knex: fx.client
    });
  });

  afterAll(() => fx.destroyClient());

  describe('simple get', () => {
    let embed;

    beforeAll(async () => {
      embed = await svc.get(80717033);
    });

    it('fetches embed with given uid', () => {
      expect(embed.uid).toBe(80717033);
    });

    it('uid, config, templates fields are provided', () => {
      expect(Object.keys(embed)).toEqual([
        'uid',
        'template',
        'config'
      ]);
    });

    it('db store field is givent in config key', () => {
      expect(embed.config.layout.lang).toBe('fr');
    });

    it('template contains all defined templates in corresponding sub-keys', () => {
      expect(Object.keys(embed.template)).toEqual([
        'header',
        'eventitem',
        'event'
      ]);
    });
  });
});
