import ih from 'immutability-helper';
import schema from '@openagenda/validators/schema/index';
import integer from '@openagenda/validators/integer';
import text from '@openagenda/validators/text';
import config from '../testconfig.js';
import svc from '../index.js';
import setup from './fixtures/setup.js';

schema.register({
  integer,
  text,
});

describe('extended events - functional (server): list', () => {
  let knex;

  beforeEach(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
    });

    svc.init(
      ih(
        { ...config, knex },
        {
          interfaces: {
            getValidator: {
              $set: (_formSchemaId) =>
                schema({
                  edition: {
                    type: 'integer',
                  },
                  contender: {
                    type: 'text',
                  },
                }),
            },
          },
        },
      ),
    );

    const fixtures = [
      [111, 0, 'steve'],
      [222, 1, 'jeff'],
      [333, 2, 'bob'],
      [444, 3, 'bill'],
      [555, 4, 'john'],
      [666, 5, 'bobby'],
      [777, 6, 'zoubi'],
      [888, 7, 'cindy'],
      [999, 8, 'nelly'],
      [123, 9, 'pinky'],
      [837, 10, 'sugar'],
      [849, 11, 'djeneene'],
      [897, 12, 'tony'],
      [901, 13, 'mikey'],
    ];

    for (const entry of fixtures) {
      await svc(29).create(entry[0], {
        edition: entry[1],
        contender: entry[2],
      });
    }
  });

  afterEach(() => knex?.destroy());

  it('list custom data by form schema id', async () => {
    expect((await svc(29).list({}, 3, 5)).items).toEqual([
      { identifier: 444, custom: { edition: 3, contender: 'bill' } },
      { identifier: 555, custom: { edition: 4, contender: 'john' } },
      { identifier: 666, custom: { edition: 5, contender: 'bobby' } },
      { identifier: 777, custom: { edition: 6, contender: 'zoubi' } },
      { identifier: 888, custom: { edition: 7, contender: 'cindy' } },
    ]);
  });

  it('list gives total', async () => {
    expect((await svc(29).list({}, 30, 5)).total).toBe(14);
  });

  it('list can target specific identifiers', async () => {
    expect(
      (await svc(29).list({ identifier: [123, 837] }, 0, 20)).items,
    ).toEqual([
      { identifier: 123, custom: { edition: 9, contender: 'pinky' } },
      { identifier: 837, custom: { edition: 10, contender: 'sugar' } },
    ]);
  });
});
