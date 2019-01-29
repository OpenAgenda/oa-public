import { promisify } from 'util';
import fixtures from '@openagenda/fixtures';
import activitiesSvc from '@openagenda/activities';

exports.seed = async knex => {
  const { testconfig, schemas } = knex.client.config;

  fixtures.init( testconfig );

  await activitiesSvc.init( testconfig );

  await promisify( fixtures )( [ {
    table: schemas.activity,
    src: __dirname + '/activity.sql'
  }, {
    table: schemas.feed,
    src: __dirname + '/feed.sql'
  }, {
    table: schemas.feed_activity,
    src: __dirname + '/feed_activity.sql'
  }, {
    table: schemas.feed_follow,
    src: __dirname + '/feed_follow.sql'
  }, {
    table: schemas.feed_notification,
    src: __dirname + '/feed_notification.sql'
  } ], { reset: false } );

};
