import testconfig from '../testconfig.js';
import createService from '../src/index.js';
import setup, { reset } from './fixtures/setup.js';

const database = `${testconfig.mysql.database}_email_utils`;
const mysql = { ...testconfig.mysql, database };
const data = [
  `${import.meta.dirname}/fixtures/emailUtilsMessageIds.data.sql`,
  `${import.meta.dirname}/fixtures/emailUtilsReplyTos.data.sql`,
];

describe('Inbox', () => {
  let emailUtils;
  let knex;

  beforeAll(async () => {
    knex = await setup({ mysql, schemas: testconfig.schemas, data });
    const service = await createService({ ...testconfig, knex });
    ({ emailUtils } = service);
  });

  beforeEach(async () => {
    await reset(knex, { schemas: testconfig.schemas, data });
  });

  afterAll(async () => {
    await knex.destroy();
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
