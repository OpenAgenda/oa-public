"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'task' );

const queues = require( '@openagenda/queues' );

const config = require( './config' );

const transfer = require( './legacy/transfer' );
const get = require( './get' );

const toLegacy = require( './legacy' );

module.exports = _.assign( task, {
  pushLegacyDatasetToCustom: agendaId => config.queue( {
    job: 'pushLegacyDatasetToCustom',
    agendaId
  } ),
  pushCustomDatasetToLegacy: agendaId => config.queue( {
    job: 'pushCustomDatasetToLegacy',
    agendaId
  } )
} );


async function task() {

  let data;

  while( data = await config.queue.waitAndPop() ) {

    const { job } = data;

    log( 'received job', _.get( data, 'job' ) );

    try {

      if ( job === 'pushLegacyDatasetToCustom' ) {

        await enqueueTransfers( data.agendaId, 'transfer' );

      } else if ( job === 'pushCustomDatasetToLegacy' ) {

        await enqueueTransfers( data.agendaId, 'toLegacy' );

      } else if ( job === 'toLegacy' ) {

        await toLegacy(
          data.formSchemaId,
          data.identifier,
          await get( data.formSchemaId, data.identifier ),
          _.pick( data, 'agendaId' )
        );

      } else {

        await transfer( data.formSchemaId, data.identifier, data.agendaId );

      }

    } catch ( e ) {

      log( 'error', 'failed to process job %j', data, e );

    }

  }

}


async function enqueueTransfers( agendaId, jobName ) {

  log( 'enqueuing %s for agendaId %s', jobName, agendaId );

  const { knex } = config;
  const { schemas } = config.legacy;

  const formSchemaIds = await _getFormSchemaIds( agendaId );

  let lastId = 0;
  let refs = [];

  while ( ( refs = await knex( schemas.agendaEvent + ' as ra' )
    .select( [
      'ra.id as ra_id',
      'uid'
    ] ).leftJoin( schemas.event + ' as e', 'ra.event_id', 'e.id' )
    .where( 'review_id', agendaId )
    .andWhere( 'ra.id', '>', lastId )
    .limit( 20 )
  ).length ) {

    for ( const ref of refs ) {
      for ( const formSchemaId of formSchemaIds ) {

        log( 'enqueing %s formSchemaId %s agendaId %s, identifier %s', jobName, formSchemaId, agendaId, ref.uid );

        await config.queue( {
          job: jobName,
          formSchemaId,
          identifier: ref.uid,
          agendaId
        } );
      }
    }

    lastId = _.last( refs ).ra_id;

  }

}


async function _getFormSchemaIds( agendaId ) {

  const { knex } = config;
  const { schemas } = config.legacy;

  const ids = [];

  const {
    agendaFormSchemaId,
    networkUid
  } = await knex( schemas.agenda ).first( [
    'form_schema_id as agendaFormSchemaId',
    'network_uid as networkUid'
  ] ).where( 'id', agendaId );

  if ( agendaFormSchemaId ) ids.push( agendaFormSchemaId );

  if ( networkUid ) {

    const { networkFormSchemaId } = await knex( 'network' )
      .first( [ 'form_schema_id as networkFormSchemaId' ] )
      .where( 'uid', networkUid );

    if ( networkFormSchemaId ) ids.push( networkFormSchemaId );

  }

  return ids;

}
