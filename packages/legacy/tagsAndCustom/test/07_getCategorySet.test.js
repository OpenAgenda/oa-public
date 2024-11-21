import knexLib from 'knex';
import getCategorySet from '../lib/getCategorySet.js';
import config from '../testconfig.js';

const knex = knexLib({ client: 'mysql', connection: config.mysql });

const interfaces = {
  getAgendaId: () => 2935,
};

test('get category set', async () => {
  const categorySet = await getCategorySet({ knex, interfaces }, 83549053);
  expect(categorySet.categories.length).toBeTruthy();
});

afterAll(
  () =>
    new Promise((done) => {
      knex.destroy();
      done();
    }),
);
