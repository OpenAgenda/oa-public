"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'task' );

const queues = require( '@openagenda/queues' );

const config = require( './config' );

const transfer = require( './legacy/transfer' );
const get = require( './get' );

const toLegacy = require( './legacy' );
const loopThroughRefs = require( './legacy/lib/loopThroughRefs' );
const getFormSchemaIds = require( './legacy/lib/getFormSchemaIds' );

module.exports = _.assign( task, {
  enqueueLegacyDatasetToCustom: agendaId => config.queue( {
    job: 'enqueueLegacyDatasetToCustom',
    agendaId
  } ),
  enqueueCustomDatasetToLegacy: agendaId => config.queue( {
    job: 'enqueueCustomDatasetToLegacy',
    agendaId
  } )
} );


async function task() {

  let data;

  while( data = await config.queue.waitAndPop() ) {

    const { job } = data;

    log( 'received job', _.get( data, 'job' ) );

    try {

      if ( job === 'enqueueLegacyDatasetToCustom' ) {

        await enqueueTransfers( data.agendaId, 'transfer' );

      } else if ( job === 'enqueueCustomDatasetToLegacy' ) {

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

  const formSchemaIds = await getFormSchemaIds( config.knex, agendaId );

  await loopThroughRefs( config.knex, agendaId, async ref => {

    for ( const formSchemaId of formSchemaIds ) {

      log( 'enqueing %s formSchemaId %s agendaId %s, identifier %s', jobName, formSchemaId, agendaId, ref.uid );

      await config.queue( {
        job: jobName,
        formSchemaId,
        identifier: ref.uid,
        agendaId
      } );
    }

  } );

}
