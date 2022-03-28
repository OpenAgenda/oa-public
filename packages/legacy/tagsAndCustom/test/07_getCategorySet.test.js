'use strict';

const knexLib = require('knex');

const getCategorySet = require('../lib/getCategorySet');
const config = require('../testconfig');

const knex = knexLib({ client: 'mysql', connection: config.mysql });

const interfaces = {
  getAgendaId: () => 2935
};

test('get category set', async () => {
  const categorySet = await getCategorySet({ knex, interfaces }, 83549053);
  expect(categorySet.categories.length).toBeTruthy();
});

afterAll(() => (new Promise(done => {
  knex.destroy();
  done();
})));
