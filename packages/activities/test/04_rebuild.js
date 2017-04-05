"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const knexLib = require( 'knex' );
const service = require( './service' );
const { rebuild } = require( '../service/rebuild' );
const winston = require( 'winston' );
const config = require( '../testconfig' );

describe.only( 'activities - rebuid', function () {

  this.timeout( 600000 );

  let knex;

  before( done => {

    knex = knexLib( {
      client: 'mysql',
      connection: config.mysql
    } );

    service.initAndLoad( config, [
      'feed',
      'feed_follow',
      'activity',
      'feed_activity',
      'rebuild_agenda',
      'rebuild_event',
      'rebuild_review_article',
      'rebuild_reviewer',
      'rebuild_user'
    ], done );

  } );

  it( 'rebuild', () => {

    return rebuild( {}, Object.assign( {}, config.mysql, {
      user_table: config.schemas.rebuild_user,
      review_table: config.schemas.rebuild_agenda,
      review_article_table: config.schemas.rebuild_review_article,
      event_table: config.schemas.rebuild_event,
      reviewer_table: config.schemas.rebuild_reviewer,

      activity_table: config.schemas.activity,
      feed_table: config.schemas.feed,
      feed_activity_table: config.schemas.feed_activity,
      feed_follow_table: config.schemas.feed_follow,
      feed_notification_table: config.schemas.feed_notification
    } ), winston )
      .then( result => {

        console.log( result );
        return result;

      } )
      .should.fulfilledWith( {
        agendasAffected: 3,
        usersAffected: 98,
        stakeholdersAffected: 101,
        eventsAffected: 256,
        reviewArticlesAffected: 256
      } );

  } );

} );