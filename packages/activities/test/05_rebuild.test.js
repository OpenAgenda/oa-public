import path from 'node:path';
import { jest } from '@jest/globals';
import rebuild from '../src/rebuild.js';
import testconfig from '../testconfig.js';
import Service from '../src/index.js';
import setup, { reset } from './fixtures/setup.js';

const migrations = [
  path.resolve(import.meta.dirname, '../migrations'),
  path.resolve(import.meta.dirname, '../../agendas/migrations'),
  path.resolve(import.meta.dirname, '../../agenda-events/migrations'),
  path.resolve(import.meta.dirname, '../../aggregators/migrations'),
  path.resolve(import.meta.dirname, '../../events/migrations'),
  path.resolve(import.meta.dirname, '../../members/migrations'),
  path.resolve(import.meta.dirname, '../../users/migrations'),
];

const data = [
  `${import.meta.dirname}/fixtures/user.data.sql`,
  `${import.meta.dirname}/fixtures/agenda.data.sql`,
  `${import.meta.dirname}/fixtures/aggregator.data.sql`,
  `${import.meta.dirname}/fixtures/stakeholder.data.sql`,
  `${import.meta.dirname}/fixtures/eventService.data.sql`,
  `${import.meta.dirname}/fixtures/agendaEvent.data.sql`,
  `${import.meta.dirname}/fixtures/activity.data.sql`,
  `${import.meta.dirname}/fixtures/feed.data.sql`,
  `${import.meta.dirname}/fixtures/feed_activity.data.sql`,
  `${import.meta.dirname}/fixtures/feed_follow.data.sql`,
  `${import.meta.dirname}/fixtures/feed_notification.data.sql`,
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
