"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const agendasSvc = require( '@openagenda/agendas' );
const agendaEvents = require( '@openagenda/agenda-events' );
const formSchemas = require( '@openagenda/form-schemas' );
const aggregators = require( '@openagenda/aggregators' );
const queue = require( '@openagenda/queue' );
const { syncAgenda } = require( '@openagenda/inboxes/dist/tasks/sync' );
const rebuildActivityFeeds = require( '@openagenda/activities/dist/service/rebuild' ).rebuild;
const logs = require( '@openagenda/logs' );

const agendaEventStats = require( './lib/agendaEventStats' );
const config = require( '../../config' );
const db = require( './lib/db' );
const legacySearch = require( './lib/legacySearch' );
const custom = require( './lib/custom' );
const search = require( '../eventSearch' );
const searchStats = require( './lib/search' );

const agendasList = promisify( agendasSvc.list );

const log = require( '@openagenda/logs' )( 'services/agendaStatistics' );

let q;

module.exports = async agendaUid => {

  const agenda = await config.knex( 'review' ).first( [ 'id', 'slug', 'form_schema_id' ] ).where( 'uid', agendaUid );

  return {
    db: await db( agenda.id ),
    legacySearch: await legacySearch( agenda.id ),
    agendaEvents: await agendaEventStats( agendaUid ),
    search: await searchStats( agendaUid ),
    hasFormSchema: !!agenda.form_schema_id,
    actions: {
      resyncLegacySearch: `${config.root}/${agenda.slug}/admin/stats/resync/legacySearch`,
      rebuildSearch: `${config.root}/${agenda.slug}/admin/stats/resync/search`,
      resyncAgendaEvents: `${config.root}/${agenda.slug}/admin/stats/resync/agendaEvents`,
      resyncInbox: `${config.root}/${agenda.slug}/admin/stats/resync/inbox`,
      resyncActivityFeeds: `${config.root}/${agenda.slug}/admin/stats/resync/activityFeeds`,
      resyncAggregator: `${config.root}/${agenda.slug}/admin/stats/resync/aggregator`
      //resyncCustom: `${config.root}/${agenda.slug}/admin/stats/resync/custom`
    }
  }

}

module.exports.init = c => {

  q = queue( 'agendaStatistics', { redis: c.redis } );

}

module.exports.resync = ( agendaUid, type ) => q( { operation: 'resync', agendaUid, type } );

module.exports.transferFormSchema = agenda => {

  log( 'transfering form schema from legacy to form schema db for agenda %d', agenda.uid );

  return formSchemas.legacy.transfer( agenda.id );

}

module.exports.task = () => {

  q.setConsumer( ( data, cb ) => {

    if ( data.operation !== 'resync' ) return cb();

    switch ( data.type ) {

      case 'custom' :

        custom( data );
        break;

      case 'aggregator':

        aggregators.resync( { uid: data.agendaUid } );
        break;

      case 'search':

        _resyncSearch( data.agendaUid );
        break;

      case 'agendaEvents':

        log( 'resyncing agenda %d - agendaEvents resync', data.agendaUid );
        agendaEvents.tasks.transferLegacyData( { agendaUid: data.agendaUid } );
        break;

      case 'legacySearch':

        _resyncLegacySearch( data.agendaUid );
        break;

      case 'inbox':

        agendasSvc.get( { uid: data.agendaUid }, { private: null, internal: true }, ( err, agenda ) => {

          const stats = {};

          syncAgenda( agenda, stats )
            .then( () => {

              log( 'info', 'Agenda %d inbox synced', agenda.uid, stats );

            } );

        } );
        break;

      case 'activityFeeds':

        rebuildActivityFeeds(
          null,
          {
            agendaUid: data.agendaUid,
            ..._.pick( config.db, [ 'database', 'host', 'port', 'user', 'password' ] ),
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
            logger: {
              debug: {
                prefix: 'oa:'
              },
              token: process.env.NODE_ENV === 'production' ? '8d66d66a-58ce-42b6-ab21-7805b075ba48' : null
            },
            cli: false
          },
          logs( 'activities/rebuild' )
        );

        break;

    }

    return cb();

  } );

  q.launch();

}

module.exports.task.resyncLegacySearch = async function() {

  let offset = 0;

  let agendas = [];

  while( ( agendas = await agendasList( offset, 1, { private: null } ) ).length ) {

    const agenda = _.first( agendas );

    await _resyncLegacySearch( agenda.uid );

    offset++;

  }

  log( 'info', 'DONE RESYNCING ALL AGENDAS' );

}

async function _resyncLegacySearch( agendaUid ) {

  log( 'info', 'resyncing agenda %d - legacy search index rebuild', agendaUid );

  const agendaId = await config.knex( 'review' ).first( 'id' ).where( 'uid', agendaUid ).then( result => result.id );

  const result = await legacySearch.resync( agendaId );

  log( 'info', 'agenda %d, resynced legacy search index', agendaId, result );

}

async function _resyncSearch( agendaUid ) {

  log( 'info', 'resyncing agenda %d - new search index rebuild', agendaUid );

  const result = await search.agendas( agendaUid ).rebuild();

  log( 'info', 'agenda %d, resynced search index', agendaUid, result );

}