import knexLib from 'knex';
import config from '../testconfig.js';
import buildEmbedControlData from '../lib/utils/buildEmbedControlData.js';
import loadEmbedControlData from '../lib/utils/loadEmbedControlData.js';
import loadFixtures from './fixtures/load.js';
import fixtures from './fixtures/06.data.js';

describe('06 - control data - embeds', () => {
  let redisClient;
  let knex;

  beforeAll(async () => {
    redisClient = await loadFixtures(config, fixtures);

    knex = knexLib({ client: 'mysql', connection: config.mysql });
  });

  afterAll(async () => {
    await redisClient.del(`${config.redisPrefix}embeds:80933440`);

    await redisClient.quit();

    await knex.destroy();
  });

  describe('build embed data', () => {
    test('SIA', async () => {
      const result = await buildEmbedControlData(
        {
          knex,
          redis: redisClient,
          prefix: config.redisPrefix,
        },
        21898722,
      );

      expect(result).toEqual({
        md: 'tiled',
        sh: {
          fb: true,
          tw: true,
          gp: true,
          li: true,
          tu: true,
          pi: true,
          em: true,
        },
        href: true,
        ues: false,
        dcss: {
          list: true,
          map: true,
          search: true,
          categories: true,
          tags: true,
          calendar: true,
          form: true,
        },
        sc: true,
        mp: 'all',
        mc: '',
        ma: false,
        mt: false,
        classes: {},
      });
    });

    test('Albi', async () => {
      const result = await buildEmbedControlData(
        {
          knex,
          redis: redisClient,
          prefix: config.redisPrefix,
          imagePath:
            'https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/main/',
        },
        80933440,
      );

      expect(result).toEqual({
        md: 'cascading',
        sh: {
          fb: true,
          tw: true,
          gp: false,
          li: false,
          tu: false,
          pi: true,
          em: true,
        },
        href: true,
        ues: false,
        dcss: {
          list: true,
          map: true,
          search: true,
          categories: true,
          tags: true,
          calendar: true,
          form: true,
        },
        sc: true,
        mp: 'all',
        mc: '51.01375465718821|17.578125|41.96765920367816|-15.205078125',
        mi: {
          a: 'https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/main/icon_46442588_43375820_a.png?110046710',
          i: 'https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/main/icon_46442588_43375820_i.png?1743347075',
        },
        ms: {
          a: [32, 38],
          i: [32, 38],
        },
        ma: true,
        mt: false,
        classes: {
          concert: 'concert',
          conference: 'conference',
          exposition: 'exposition',
          lecture: 'lecture',
          projection: 'projection',
          rencontre: 'rencontre',
          spectacle: 'spectacle',
        },
      });
    });
  });

  describe('store embed control data', () => {
    test('embed control data is built and stored if unavailable', async () => {
      await redisClient.del(`${config.redisPrefix}embeds:80933440`);

      const str = await loadEmbedControlData(
        {
          knex,
          redis: redisClient,
          prefix: config.redisPrefix,
          imagePath:
            'https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/main/',
        },
        80933440,
      );

      expect(str).toBe(
        '{"md":"cascading","sh":{"fb":true,"tw":true,"gp":false,"li":false,"tu":false,"pi":true,"em":true},"href":true,"ues":false,"dcss":{"list":true,"map":true,"search":true,"categories":true,"tags":true,"calendar":true,"form":true},"sc":true,"mp":"all","mc":"51.01375465718821|17.578125|41.96765920367816|-15.205078125","ma":true,"mt":false,"classes":{"concert":"concert","conference":"conference","exposition":"exposition","lecture":"lecture","projection":"projection","rencontre":"rencontre","spectacle":"spectacle"},"mi":{"a":"https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/main/icon_46442588_43375820_a.png?110046710","i":"https://02034510ef5d488190e4cf17d19a788b.s3.pub1.infomaniak.cloud/main/icon_46442588_43375820_i.png?1743347075"},"ms":{"a":[32,38],"i":[32,38]}}',
      );

      const stored = await redisClient.get(
        `${config.redisPrefix}embeds:80933440`,
      );

      expect(stored).toBe(str);
    });
  });
});
