'use strict';

const path = require('node:path');
const rebuild = require('../src/rebuild');
const testconfig = require('../testconfig');
const Service = require('../src');
const setup = require('./fixtures/setup');

const { reset } = setup;

const migrations = [
  path.resolve(__dirname, '../migrations'),
  path.resolve(__dirname, '../../agendas/migrations'),
  path.resolve(__dirname, '../../agenda-events/migrations'),
  path.resolve(__dirname, '../../aggregators/migrations'),
  path.resolve(__dirname, '../../events/migrations'),
  path.resolve(__dirname, '../../members/migrations'),
  path.resolve(__dirname, '../../users/migrations'),
];

const data = [
  `${__dirname}/fixtures/user.data.sql`,
  `${__dirname}/fixtures/agenda.data.sql`,
  `${__dirname}/fixtures/aggregator.data.sql`,
  `${__dirname}/fixtures/stakeholder.data.sql`,
  `${__dirname}/fixtures/eventService.data.sql`,
  `${__dirname}/fixtures/agendaEvent.data.sql`,
  `${__dirname}/fixtures/activity.data.sql`,
  `${__dirname}/fixtures/feed.data.sql`,
  `${__dirname}/fixtures/feed_activity.data.sql`,
  `${__dirname}/fixtures/feed_follow.data.sql`,
  `${__dirname}/fixtures/feed_notification.data.sql`,
];

describe.skip('activities - rebuild', () => {
  jest.setTimeout(600000);

  let service;
  let knex;

  beforeAll(async () => {
    knex = await setup({
      mysql: testconfig.mysql,
      schemas: testconfig.schemas,
      migrations,
      data,
    });
    service = await Service({ ...testconfig, knex });
  });

  beforeEach(() => reset(knex, { data }));

  afterAll(() => knex.destroy());

  it('rebuild', () =>
    expect(
      rebuild({ service, knex, schemas: testconfig.schemas }, {}).then(
        (result) => {
          console.log(result);
          return result;
        },
      ),
    ).resolves.toMatchObject({
      agendasAffected: 3,
      usersAffected: 108,
      stakeholdersAffected: 100,
      eventsAffected: 256,
      reviewArticlesAffected: 256,
    }));
});
