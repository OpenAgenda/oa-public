import knexLib from 'knex';
import fixtures from '@openagenda/fixtures';
import testconfig from '../testconfig.js';
import { initAndLoad, seed } from './service/index.js';

const database = `${testconfig.mysql.database}_email_utils`;

describe('Inbox', () => {
  let emailUtils;
  let service;
  let knex;

  const tables = ['emailUtilsMessageIds', 'emailUtilsReplyTos'];

  beforeAll(() => {
    knex = knexLib({
      schemas: testconfig.schemas,
      client: 'mysql2',
      connection: {
        ...testconfig.mysql,
        database,
      },
    });
  });

  beforeAll(async () => {
    service = await initAndLoad(
      {
        ...testconfig,
        knex,
        mysql: { ...testconfig.mysql, database },
      },
      [],
    );

    ({ emailUtils } = service);
  });

  afterAll(async () => fixtures.getConnection().destroy());

  beforeEach(async () => {
    await service.config.knex.transaction(async (trx) => {
      await trx.raw('SET foreign_key_checks = 0');
      for (const table of tables) {
        await trx(service.config.schemas[table]).truncate();
      }
      await trx.raw('SET foreign_key_checks = 1');
    });

    await seed(
      {
        ...testconfig,
        mysql: { ...testconfig.mysql, database },
      },
      tables,
    );
  });

  afterAll(async () => {
    // await service.config.knex.raw(`DROP DATABASE IF EXISTS ${database}`);
    await service.config.knex.destroy();
  });

  test('list message ids', async () => {
    expect(await emailUtils(1).messageIds.list()).toEqual([
      '1222@mailthingie.com',
    ]);
  });

  test('insert message id', async () => {
    await emailUtils(1).messageIds.insert('grut@mail.com');
    expect(await emailUtils(1).messageIds.list()).toEqual([
      '1222@mailthingie.com',
      'grut@mail.com',
    ]);
  });

  test('inserted message Id cannot be empty', async () => {
    let error;
    try {
      await emailUtils(1).messageIds.insert('');
    } catch (e) {
      error = e;
    }

    expect(error.name).toBe('BadRequest');
  });

  test('list reply tos', async () => {
    expect(await emailUtils(1).replyTos.list()).toEqual([
      { userUid: 1, replyTo: 'schmilblick@email.com' },
    ]);
  });

  test('insert reply to', async () => {
    await emailUtils(1).replyTos.insert(123, '123@email.com');
    expect(await emailUtils(1).replyTos.list()).toEqual([
      { userUid: 1, replyTo: 'schmilblick@email.com' },
      { userUid: 123, replyTo: '123@email.com' },
    ]);
  });

  test('insertIfDifferent does not insert if is same as user email', async () => {
    await emailUtils(1).replyTos.insertIfDifferent(
      { email: '123@email.com', uid: 123 },
      '<123@email.com>',
    );

    expect(await emailUtils(1).replyTos.list()).toEqual([
      { userUid: 1, replyTo: 'schmilblick@email.com' },
    ]);
  });

  test('insertIfDifferent inserts if is different than user email', async () => {
    await emailUtils(1).replyTos.insertIfDifferent(
      { email: '123@email.com', uid: 123 },
      '<321@email.com>',
    );

    expect(await emailUtils(1).replyTos.list()).toEqual([
      { userUid: 1, replyTo: 'schmilblick@email.com' },
      { userUid: 123, replyTo: '321@email.com' },
    ]);
  });

  test('insertIfDifferent inserts if is different than user email and email string includes name', async () => {
    await emailUtils(1).replyTos.insertIfDifferent(
      { email: '123@email.com', uid: 123 },
      'Mr 321 <321@email.com>',
    );

    expect(await emailUtils(1).replyTos.list()).toEqual([
      { userUid: 1, replyTo: 'schmilblick@email.com' },
      { userUid: 123, replyTo: '321@email.com' },
    ]);
  });

  test('insert only takes in emails', async () => {
    let error;
    try {
      await emailUtils(1).replyTos.insert(123, 'fdqsfhdqs');
    } catch (e) {
      error = e;
    }

    expect(error.name).toBe('BadRequest');
  });
});
