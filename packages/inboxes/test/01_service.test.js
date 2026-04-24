import testconfig from '../testconfig.js';
import createService from '../src/index.js';
import setup from './fixtures/setup.js';

const database = `${testconfig.mysql.database}_service`;
const mysql = { ...testconfig.mysql, database };

const serviceShape = {
  Inbox: expect.any(Function),
  InboxUsers: expect.any(Function),
  InboxUser: expect.any(Function),
  Conversations: expect.any(Function),
  Conversation: expect.any(Function),
  tasks: {
    sync: expect.any(Function),
  },
};

describe('service', () => {
  let knex;

  beforeAll(async () => {
    knex = await setup({
      mysql,
      schemas: testconfig.schemas,
    });
  });

  afterAll(async () => {
    await knex.destroy();
  });

  test('simple init', async () => {
    await expect(
      createService({
        ...testconfig,
        knex,
        logger: { namespace: 'test:' },
      }),
    ).resolves.toMatchObject(serviceShape);
  });
});
