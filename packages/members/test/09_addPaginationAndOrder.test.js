'use strict';

const knex = require('knex');
const addPaginationAndOrder = require('../lib/addPaginationAndOrder');

describe('members - unit - addPaginationAndOrder', () => {
  test('unless order column is id, members order should be composed with id', () => {
    const k = knex({ client: 'mysql' })('the_table');
    addPaginationAndOrder(k, { after: [], offset: 0, order: 'slug.asc' });
    expect(k.toString()).toEqual(
      'select * from `the_table` order by `slug` asc, `id` asc limit 20'
    );
  });
});
