const _ = require( 'lodash' );
const Program = require( 'caporal/lib/program' );
const knexLib = require( 'knex' );
const nodefn = require( 'when/node' );
const log = require( '@openagenda/logs' )( 'activities/rebuild' );
const service = require( './index' );

const traverseTable = require( '../utils/traverseTable' );

const prog = new Program();

let knex;

const initProg = () => prog
  .version( '1.0.0' )
  .logger( log )
  .description( 'Rebuild all feeds of a database' )

  .option( '-a, --agendaUid', 'Uid of the agenda to rebuild' )

  .option( '-d, --database', 'Database to use.', null, 'oadev', true )
  .option( '-h, --host', 'Connect to host.', null, 'localhost', true )
  .option( '-p, --port', 'Port number to use for connection.', prog.INT, 3306, true )
  .option( '-u, --user', 'User for login.', null, 'root', true )
  .option( '-p, --password', 'Password to use when connecting to server.', null, 'grut', true )

  // .option( '-i, --interval', 'The interval between each iteration of a loop', prog.INT, 100, true )

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

  .option( '--since', 'The timestamp since the rebuild should start', prog.INT, 0, true )
  .option( '--cli', 'Used in CLI or not', prog.BOOL, true, true )
  .action( rebuild );

initProg();

module.exports = ( ...args ) => prog.parse( [ , , ...args ] );
module.exports.parse = ( ...args ) => prog.parse( ...args );
module.exports.rebuild = rebuild;

async function rebuild( args, options, logger ) {

  const mysqlConfig = _.pick( options, [ 'database', 'host', 'port', 'user', 'password' ] );

  knex = knexLib( {
    client: 'mysql',
    connection: mysqlConfig
  } );

  const results = {};

  if ( options.cli ) {
    await service.init( {
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
    } );
  }

  if ( logger && logger.setConfig && options.logger ) {
    logger.setConfig( options.logger );
  } else {
    logger.setConfig( { debug: { enable: true } } );
  }

  if ( !options.agendaUid ) {

    const usersAffected = await eachUsers( onEachUser );

    results.usersAffected = usersAffected;

  }

  const eventsAffected = await eachEvents( onEachEvent );

  results.eventsAffected = eventsAffected;

  const agendasAffected = await eachAgendas( onEachAgenda );

  results.agendasAffected = agendasAffected;

  await knex.destroy();

  if ( options.cli ) {
    await service.shutdown();
  }

  return results;


  function onEachUser( user, i, next ) {

    logger.info( 'user', i );

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

    logger.info( 'event', i );

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

            logger.error( err );

          } );

      } )
      .then( () => next() )
      .catch( err => {

        logger.error( err );
        next( err );

      } );

  }

  function onEachAgenda( agenda, i, next ) {

    logger.info( 'agenda', i );

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

        return (/* agenda.aggId ? Promise.resolve( 0 ) : */ eachReviewArticles( agenda, onEachReviewArticle ))
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

        logger.error( err );
        next( err );

      } );

  }

  function onEachReviewArticle( ra, i, next ) {

    logger.info( 'review_article', i );

    service.feed( {
      entityType: 'agenda',
      entityUid: ra.reviewUid
    } ).follow( { entityType: 'event', entityUid: ra.eventUid } )
      .then( result => {

        return result ? result : Promise.reject( new Error( 'Feed doesn\'t exists' ) );

      } )
      .then( () => next() )
      .catch( err => {

        if ( !ra.eventUid ) { // TODO is not normal, bordel
          return next();
        }

        if ( err && err.message === 'Feed already followed' ) return next();
        if ( err && err.message === 'Feed doesn\'t exists' ) {

          return service.feed( { entityType: 'event', entityUid: ra.eventUid } ).create( err => {

            if ( err ) {

              logger.error( err );
              logger.info( 'reviewUid', ra.reviewUid );
              logger.info( 'eventUid', ra.eventUid );
              return next( err );

            }

            onEachReviewArticle( ra, i, next );

          } );

        }

        logger.error( err );
        logger.info( 'reviewUid', ra.reviewUid );
        logger.info( 'eventUid', ra.eventUid );
        next( err );

      } );

  }

  function onEachStakeholder( stakeholder, i, next ) {

    logger.info( 'stakeholder', i );

    if ( stakeholder.userRemoved ) return next();

    service.feed( {
      entityType: 'user',
      entityUid: stakeholder.userUid
    } ).unfollow( { entityType: 'agenda', entityUid: stakeholder.reviewUid } )
      .then( () => {

        service.feed( {
          entityType: 'user',
          entityUid: stakeholder.userUid
        } ).follow( { entityType: 'agenda', entityUid: stakeholder.reviewUid }, { credential: stakeholder.credential } )
          .then( () => next() )
          .catch( err => {

            if ( err && err.message === 'Feed already followed' ) return next();

            logger.error( err );
            next( err );

          } );

      } );

  }

  function eachUsers( eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.userTable,
      q => {
        if ( options.since ) {
          q.where( `${options.userTable}.updated_at`, '>=', new Date( options.since * 1000 ) );
        }

        return q;
      },
      eachCb
    );

  }

  function eachEvents( eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.eventTable,
      q => {
        q.select( [
          options.eventTable + '.*',
          options.userTable + '.uid as userUid',
          options.userTable + '.is_removed as userRemoved'
        ] )
          .join( options.userTable, options.eventTable + '.owner_id', options.userTable + '.id' );

        if ( options.agendaUid ) {
          q.where( `${options.eventTable}.origin_uid`, options.agendaUid );
        }

        if ( options.since ) {
          q.where( `${options.eventTable}.updated_at`, '>=', new Date( options.since * 1000 ) );
        }

        return q;
      },
      eachCb
    );

  }

  function eachAgendas( eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.reviewTable,
      q => {
        q.select( [
          options.reviewTable + '.*',
          options.userTable + '.uid as userUid',
          options.userTable + '.is_removed as userRemoved',
          options.aggregatorTable + '.id as aggId'
        ] )
          .join( options.userTable, options.reviewTable + '.owner_id', options.userTable + '.id' )
          .leftJoin( options.aggregatorTable, options.reviewTable + '.id', options.aggregatorTable + '.review_id' );

        if ( options.agendaUid ) {
          q.where( `${options.reviewTable}.uid`, options.agendaUid );
        }

        if ( options.since ) {
          q.where( `${options.reviewTable}.updated_at`, '>=', new Date( options.since * 1000 ) );
        }

        return q;
      },
      // .where( options.userTable + '.is_removed', 0 ),
      eachCb
    );

  }

  function eachReviewArticles( agenda, eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.reviewArticleTable,
      q => {
        q.select( [
          options.reviewArticleTable + '.*',
          options.reviewTable + '.uid as reviewUid',
          options.eventTable + '.uid as eventUid'
        ] )
          .join( options.reviewTable, options.reviewArticleTable + '.review_id', options.reviewTable + '.id' )
          .join( options.eventTable, options.reviewArticleTable + '.event_id', options.eventTable + '.id' )
          .where( 'review_id', agenda.id );

        if ( options.since ) {
          q.where( `${options.reviewTable}.updated_at`, '>=', new Date( options.since * 1000 ) );
        }

        return q;
      },
      eachCb
    );

  }

  function eachStakeholders( agenda, eachCb ) {

    return nodefn.call(
      traverseTable,
      knex,
      options.reviewerTable,
      q => {
        q.select( [
          options.reviewerTable + '.*',
          options.reviewTable + '.uid as reviewUid',
          options.userTable + '.uid as userUid',
          options.userTable + '.is_removed as userRemoved'
        ] )
          .join( options.reviewTable, options.reviewerTable + '.review_id', options.reviewTable + '.id' )
          .join( options.userTable, options.reviewerTable + '.user_id', options.userTable + '.id' )
          .where( 'review_id', agenda.id );

        if ( options.since ) {
          q.where( `${options.reviewTable}.updated_at`, '>=', new Date( options.since * 1000 ) );
        }

        return q;
      },
      eachCb
    );

  }

}
