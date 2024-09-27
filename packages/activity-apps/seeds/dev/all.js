import { promisify } from 'node:util';
import fixtures from '@openagenda/fixtures';
import activitiesSvc from '@openagenda/activities';

export async function seed(knex) {
  const { testconfig, schemas } = knex.client.config;

  fixtures.init(testconfig);

  await activitiesSvc.init(testconfig);

  await promisify(fixtures)(
    [
      {
        table: schemas.activity,
        src: `${import.meta.dirname}/activity.sql`,
      },
      {
        table: schemas.feed,
        src: `${import.meta.dirname}/feed.sql`,
      },
      {
        table: schemas.feed_activity,
        src: `${import.meta.dirname}/feed_activity.sql`,
      },
      {
        table: schemas.feed_follow,
        src: `${import.meta.dirname}/feed_follow.sql`,
      },
      {
        table: schemas.feed_notification,
        src: `${import.meta.dirname}/feed_notification.sql`,
      },
    ],
    { reset: false },
  );
}
