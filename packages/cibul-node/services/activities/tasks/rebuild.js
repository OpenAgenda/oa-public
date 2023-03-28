'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('activities/rebuild');
const rebuildActivityFeeds = require('@openagenda/activities/dist/service/rebuild').rebuild;

const sinceKey = 'activities:rebuild:since';

function runRebuild({ config, since, agendaUid, activities }) {
  return rebuildActivityFeeds(
    null,
    {
      since: since || 0,
      agendaUid,
      knex: config.knex,
      activityTable: config.schemas.activity,
      feedTable: config.schemas.feed,
      feedActivityTable: config.schemas.feed_activity,
      feedFollowTable: config.schemas.feed_follow,
      feedNotificationTable: config.schemas.feed_notification,
      userTable: config.schemas.user,
      reviewTable: config.schemas.agenda,
      reviewArticleTable: config.schemas.agendaEvent,
      eventTable: config.schemas.event,
      reviewerTable: config.schemas.stakeholder,
      aggregatorTable: config.schemas.aggregator,
      migrationTable: 'activity_migrations',
      logger: config.getLogConfig('oa', 'activities', false),
      cli: false,
      service: activities,
    },
    log,
  );
}

function rebuildActivities({ config, services }) {
  const {
    redis: redisClient,
    activities,
  } = services;

  redisClient.get(sinceKey, (err, result) => {
    if (err) {
      log.error('Rebuild failed: could not fetch redis key', err);
      return;
    }
    const since = parseInt(result, 10);
    const startTime = Math.floor(Date.now() / 1000);

    runRebuild({
      config,
      activities,
      since,
    }).then(() => {
      log.info('Synchronization end !', { since });
      redisClient.set(sinceKey, startTime, _.noop);
    }, e => {
      log.error('Error on activities syncing:', e);
    });
  });
}

module.exports = ({ config, services }) => ({
  rebuild: () => rebuildActivities({ services, config }),
  agendaRebuild: agendaUid => runRebuild({
    activities: services.activities,
    config,
    agendaUid,
  }),
});
