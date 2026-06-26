import ih from 'immutability-helper';
import schema from '@openagenda/validators/schema/index';
import text from '@openagenda/validators/text';
import config from '../testconfig.js';
import svc from '../index.js';
import setup from './fixtures/setup.js';

schema.register({
  text,
});

const idents = (rows) => rows.map((r) => r.identifier);

describe('custom - functional: searchByValue', () => {
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
              $set: () =>
                schema({
                  email: { type: 'text' },
                  name: { type: 'text' },
                }),
            },
          },
        },
      ),
    );

    // Same member (identifier 111) answers two distinct member schemas; a second
    // member (222) answers only the first — to prove the search spans schemas.
    await svc(29).create(111, { email: 'alice@example.com', name: 'alice' });
    await svc(29).create(222, { email: 'bob@example.com', name: 'bob' });
    await svc(30).create(111, { email: 'alice@example.com', name: 'alice-30' });
  });

  afterEach(() => knex?.destroy());

  it('finds records whose answers contain the value, across schemas', async () => {
    const rows = await svc.searchByValue('alice@example.com');

    expect(
      rows.map((r) => ({
        identifier: r.identifier,
        formSchemaId: r.formSchemaId,
      })),
    ).toEqual(
      expect.arrayContaining([
        { identifier: 111, formSchemaId: 29 },
        { identifier: 111, formSchemaId: 30 },
      ]),
    );
    expect(rows).toHaveLength(2);
  });

  it('matches ANY of several values', async () => {
    const rows = await svc.searchByValue([
      'alice@example.com',
      'bob@example.com',
    ]);

    expect(idents(rows).sort()).toEqual([111, 111, 222]);
  });

  it('paginates with afterId as a stable cursor', async () => {
    const first = await svc.searchByValue('alice@example.com', { limit: 1 });
    expect(first).toHaveLength(1);

    const next = await svc.searchByValue('alice@example.com', {
      limit: 1,
      afterId: first[0].id,
    });
    expect(next).toHaveLength(1);
    expect(next[0].id).toBeGreaterThan(first[0].id);
    // the two pages together cover both schemas
    expect([first[0].formSchemaId, next[0].formSchemaId].sort()).toEqual([
      29, 30,
    ]);
  });

  it('does not match a value absent from every answer', async () => {
    expect(await svc.searchByValue('nobody@example.com')).toEqual([]);
  });

  it('matches a whole field value, not a substring of it', async () => {
    expect(await svc.searchByValue('example.com')).toEqual([]);
  });
});
