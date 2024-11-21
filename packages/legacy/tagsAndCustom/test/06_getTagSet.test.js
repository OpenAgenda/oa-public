import knexLib from 'knex';
import getTagSet from '../lib/getTagSet.js';
import config from '../testconfig.js';

const knex = knexLib({ client: 'mysql', connection: config.mysql });

const interfaces = {
  getAgendaId: () => 20062,
};

test('get tag set', async () => {
  const tagSet = await getTagSet({ knex, interfaces }, 89904399);
  expect(tagSet.groups.length).toBeTruthy();
});

afterAll(
  () =>
    new Promise((done) => {
      knex.destroy();
      done();
    }),
);
