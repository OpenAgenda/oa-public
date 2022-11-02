"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const service = require( './service' );
const { rebuild } = require( '../src/service/rebuild' );
const config = require( '../testconfig' );

describe.skip( 'activities - rebuid', function () {

  jest.setTimeout( 600000 );

  let knex;

  beforeAll(async () => {

    knex = knexLib( {
      client: 'mysql',
      connection: config.mysql
    } );

    await service.initAndLoad( {
      ...config,
      knex
    }, [
      'feed',
      'feed_follow',
      'feed_activity',
      'feed_notification',
      'activity',
      'rebuild_agenda',
      'rebuild_event',
      'rebuild_review_article',
      'rebuild_reviewer',
      'rebuild_user',
      'rebuild_aggregator',
    ] );

  });

  it('rebuild', () => {

    return expect(rebuild( {}, Object.assign( {}, config.mysql, {
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

      migrationTable: config.migrations.tableName
    } ), {
      info: console.log,
      error: console.error
    } )
      .then( result => {

        console.log( result );
        return result;

      } )
      .catch( err => {

        console.error( err );

      } )).resolves.toMatchObject( {
        agendasAffected: 3,
        usersAffected: 108,
        stakeholdersAffected: 100,
        eventsAffected: 256,
        reviewArticlesAffected: 172
      } );

  });

} );
