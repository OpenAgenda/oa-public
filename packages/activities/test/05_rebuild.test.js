'use strict';

const knexLib = require('knex');
const { rebuild } = require('../src/rebuild');
const config = require('../testconfig');
const Service = require('./service');

describe.skip('activities - rebuid', () => {
  jest.setTimeout(600000);

  let service;
  let knex;

  beforeAll(async () => {
    knex = knexLib({
      client: 'mysql2',
      connection: config.mysql,
    });

    service = await Service.initAndLoad(
      {
        ...config,
        knex,
      },
      [
        'activity',
        'feed',
        'feed_activity',
        'feed_follow',
        'feed_notification',
        'rebuild_agenda',
        'rebuild_event',
        'rebuild_review_article',
        'rebuild_reviewer',
        'rebuild_user',
        'rebuild_aggregator',
      ],
    );
  });

  it('rebuild', () =>
    expect(
      rebuild(
        {},
        {
          ...config.mysql,
          userTable: config.schemas.rebuild_user,
          reviewTable: config.schemas.rebuild_agenda,
          reviewArticleTable: config.schemas.rebuild_review_article,
          eventTable: config.schemas.rebuild_event,
          reviewerTable: config.schemas.rebuild_reviewer,
          aggregatorTable: config.schemas.rebuild_aggregator,

          activityTable: config.schemas.activity,
          feedTable: config.schemas.feed,
          feedActivityTable: config.schemas.feed_activity,
          feedFollowTable: config.schemas.feed_follow,
          feedNotificationTable: config.schemas.feed_notification,

          migrationTable: config.migrations.tableName,

          service,
        },
        {
          info: console.log,
          error: console.error,
        },
      )
        .then((result) => {
          console.log(result);
          return result;
        })
        .catch((err) => {
          console.error(err);
        }),
    ).resolves.toMatchObject({
      agendasAffected: 3,
      usersAffected: 108,
      stakeholdersAffected: 100,
      eventsAffected: 256,
      reviewArticlesAffected: 256,
    }));
});
