const _ = require( 'lodash' );
const Program = require( 'caporal/lib/program' );
const knexLib = require( 'knex' );
const nodefn = require( 'when/node' );
const service = require( './index' );
const traverseTable = require( '../utils/traverseTable' );

const prog = new Program();

let knex;

const initProg = () => prog
  .version( '1.0.0' )
  .description( 'Rebuild all feeds of a database' )
  .option( '-d, --database', 'Database to use.', null, 'oadev', true )
  .option( '-h, --host', 'Connect to host.', null, 'localhost', true )
  .option( '-p, --port', 'Port number to use for connection.', prog.INT, 3306, true )
  .option( '-u, --user', 'User for login.', null, 'root', true )
  .option( '-p, --password', 'Password to use when connecting to server.', null, 'grut', true )

  .option( '-i, --interval', 'The interval between each iteration of a loop', prog.INT, 100, true )

  .option( '--activity_table', 'activity table', null, 'activity', true )
  .option( '--feed_table', 'feed table', null, 'activity_feed', true )
  .option( '--feed_activity_table', 'feed_activity table', null, 'activity_feed_activity', true )
  .option( '--feed_follow_table', 'feed_follow table', null, 'activity_feed_follow', true )
  .option( '--feed_notification_table', 'feed_notification table', null, 'activity_feed_notification', true )

  .option( '--user_table', 'user table', null, 'user', true )
  .option( '--review_table', 'review table', null, 'review', true )
  .option( '--review_article_table', 'review_article table', null, 'review_article', true )
  .option( '--event_table', 'event table', null, 'event', true )
  .option( '--reviewer_table', 'reviewer table', null, 'reviewer', true )
  .option( '--aggregator_table', 'aggregator table', null, 'aggregator', true )

  .option( '--migration_table', 'migration table', null, 'activity_migrations', true )
  .action( rebuild );

initProg();

module.exports = ( ...args ) => prog.parse( [ , , ...args ] );
module.exports.parse = ( ...args ) => prog.parse( ...args );
module.exports.rebuild = rebuild;

function rebuild( args, options, logger ) {

  const mysqlConfig = _.pick( options, [ 'database', 'host', 'port', 'user', 'password' ] );

  knex = knexLib( {
    client: 'mysql',
    connection: mysqlConfig
  } );

  const results = {};

  return service.init( {
    mysql: mysqlConfig,
    schemas: {
      activity: options.activityTable,
      feed: options.feedTable,
      feed_activity: options.feedActivityTable,
      feed_follow: options.feedFollowTable,
      feed_notification: options.feedNotificationTable
    },
    migrations: {
      tableName: options.migrationTable
    },
    queue: {
      names: {
        addActivity: 'notificationAddActivityRebuild',
        sendSummary: 'notificationSendSummaryRebuild'
      },
      redis: {
        host: 'localhost',
        port: 6379
      }
    }
  } )
    .then( () => {

      return Promise.resolve()
      /* knex( options.feedTable ).del()
        .then( () => knex( options.activityTable ).del() ) */
        .then( () => {

          return eachUsers( onEachUser )
            .then( usersAffected => results.usersAffected = usersAffected )
            .then( () => {

              return eachEvents( onEachEvent )
                .then( eventsAffected => results.eventsAffected = eventsAffected );

            } )
            .then( () => {

              return eachAgendas( onEachAgenda )
                .then( agendasAffected => results.agendasAffected = agendasAffected );

            } );

        } );

    } )
    .then( () => results );

  function onEachUser( user, i, next ) {

    console.log( 'user', i );

    if ( user.is_removed ) return next();

    service.feed( { entityType: 'user', entityUid: user.uid } ).create()
      .then( () => next() )
      .catch( err => {

        if ( err && err.message === 'Feed already exists' ) {
          return next();
        }

        next( err );

      } );

  }

  function onEachEvent( event, i, next ) {

    console.log( 'event', i );

    if ( !event.uid ) return next();

    service.feed( { entityType: 'event', entityUid: event.uid } ).create( { internal: true } )
      .catch( err => {

        if ( err && err.message === 'Feed already exists' ) {
          return service.feed( {
            entityType: 'event',
            entityUid: event.uid
          } ).get( { internal: true } );
        }

        return Promise.reject( err );

      } )
      .then( eventFeed => {

        if ( event.userRemoved ) return Promise.resolve();

        return service.feed( {
          entityType: 'user',
          entityUid: event.userUid
        } ).follow( eventFeed.id )
          .catch( err => {

            if ( err && err.message === 'Feed already followed' ) return;

            console.error( err );

          } );

      } )
      .then( () => next() )
      .catch( err => {

        console.error( err );
        next( err );

      } );

  }

  function onEachAgenda( agenda, i, next ) {

    console.log( 'agenda', i );

    if ( !agenda.uid ) return next();

    return service.feed( {
      entityType: 'agenda',
      entityUid: agenda.uid
    } ).create( { internal: true } )
      .catch( err => {

        if ( err && err.message === 'Feed already exists' ) {
          return service.feed( {
            entityType: 'agenda',
            entityUid: agenda.uid
          } ).get( { internal: true } );
        }

        return Promise.reject( err );

      } )
      .then( agendaFeed => {

        if ( agenda.userRemoved ) return Promise.resolve();

        return service.feed( {
          entityType: 'user',
          entityUid: agenda.userUid
        } ).follow( agendaFeed.id )
          .catch( err => {

            if ( err && err.message === 'Feed already followed' ) return;

            return Promise.reject( err );

          } );

      } )
      .then( () => {

        return (agenda.aggId ? Promise.resolve( 0 ) : eachReviewArticles( agenda, onEachReviewArticle ))
          .then( reviewArticlesAffected => {

            results.reviewArticlesAffected = (results.reviewArticlesAffected || 0) + reviewArticlesAffected;

          } )
          .then( () => {

            return eachStakeholders( agenda, onEachStakeholder )
              .then( stakeholdersAffected => {

                results.stakeholdersAffected = (results.stakeholdersAffected || 0) + stakeholdersAffected;

                next();

              } );

          } );

      } )
      .catch( err => {

        console.error( err );
        next( err );

      } );

  }

  function onEachReviewArticle( ra, i, next ) {

    console.log( 'review_article', i );

    service.feed( {
      entityType: 'agenda',
      entityUid: ra.reviewUid
    } ).follow( { entityType: 'event', entityUid: ra.eventUid } )
      .then( result => {

        return result ? result : Promise.reject( new Error( 'Feed doesn\'t exists' ) );

      } )
      .then( () => next() )
      .catch( err => {

        if ( err && err.message === 'Feed already followed' ) return next();
        if ( err && err.message === 'Feed doesn\'t exists' ) {

          return service.feed( { entityType: 'event', entityUid: ra.eventUid } ).create( err => {

            if ( err ) {

              console.error( err );
              console.log( 'reviewUid', ra.reviewUid );
              console.log( 'eventUid', ra.eventUid );
              return next( err );

            }

            onEachReviewArticle( ra, i, next );

          } );

        }

        console.error( err );
        console.log( 'reviewUid', ra.reviewUid );
        console.log( 'eventUid', ra.eventUid );
        next( err );

      } );

  }

  function onEachStakeholder( stakeholder, i, next ) {

    console.log( 'stakeholder', i );

    if ( stakeholder.userRemoved ) return next();

    service.feed( {
      entityType: 'user',
      entityUid: stakeholder.userUid
    } ).follow( { entityType: 'agenda', entityUid: stakeholder.reviewUid }, { credential: stakeholder.credential } )
      .then( () => next() )
      .catch( err => {

        if ( err && err.message === 'Feed already followed' ) return next();

        console.error( err );
        next( err );

      } );

  }

  function eachUsers( eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.userTable,
      q => q.orderBy( 'id', 'desc' ),
      eachCb
    );

  }

  function eachAgendas( eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.reviewTable,
      q => q.select( [
        options.reviewTable + '.*',
        options.userTable + '.uid as userUid',
        options.userTable + '.is_removed as userRemoved',
        options.aggregatorTable + '.id as aggId'
      ] )
        .join( options.userTable, options.reviewTable + '.owner_id', options.userTable + '.id' )
        .leftJoin( options.aggregatorTable, options.reviewTable + '.id', options.aggregatorTable + '.review_id' )
        .where( options.userTable + '.is_removed', 0 ),
      eachCb
    );

  }

  function eachEvents( eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.eventTable,
      q => q.select( [
        options.eventTable + '.*',
        options.userTable + '.uid as userUid',
        options.userTable + '.is_removed as userRemoved'
      ] )
        .join( options.userTable, options.eventTable + '.owner_id', options.userTable + '.id' ),
      eachCb
    );

  }

  function eachReviewArticles( agenda, eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.reviewArticleTable,
      q => q.select( [
        options.reviewArticleTable + '.*',
        options.reviewTable + '.uid as reviewUid',
        options.eventTable + '.uid as eventUid'
      ] )
        .join( options.reviewTable, options.reviewArticleTable + '.review_id', options.reviewTable + '.id' )
        .join( options.eventTable, options.reviewArticleTable + '.event_id', options.eventTable + '.id' )
        .where( 'review_id', agenda.id ),
      eachCb
    );

  }

  function eachStakeholders( agenda, eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.reviewerTable,
      q => q.select( [
        options.reviewerTable + '.*',
        options.reviewTable + '.uid as reviewUid',
        options.userTable + '.uid as userUid',
        options.userTable + '.is_removed as userRemoved'
      ] )
        .join( options.reviewTable, options.reviewerTable + '.review_id', options.reviewTable + '.id' )
        .join( options.userTable, options.reviewerTable + '.user_id', options.userTable + '.id' )
        .where( 'review_id', agenda.id ),
      eachCb
    );

  }

}
