"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'task' );

const queues = require( '@openagenda/queues' );

const config = require( './config' );

const transfer = require( './legacy/transfer' );

module.exports = _.extend( task, { resync } );

function resync( formSchemaId, agendaId ) {

  return config.queue( { job: 'resync', formSchemaId, agendaId } );

}

async function task() {

  let data;

  while( data = await config.queue.waitAndPop() ) {

    const { job } = data;

    try {

      if ( job === 'resync' ) {

        await enqueueLegacyReferences( data.formSchemaId, data.agendaId );

      } else {

        await transfer( data.formSchemaId, data.identifier, data.agendaId );

      }

    } catch ( e ) {

      log( 'error', 'failed to process job %j', data, e );

    }

  }

}

async function enqueueLegacyReferences( formSchemaId, agendaId ) {

  const { knex } = config;
  const { schemas } = config.legacy;
  
  let lastId = 0;
  let refs = []

  while ( ( refs = await knex( schemas.agendaEvent + ' as ra' )
    .select( [
      'ra.id as ra_id',
      'uid'
    ] ).leftJoin( schemas.event + ' as e', 'ra.event_id', 'e.id' )
    .where( 'review_id', agendaId )
    .andWhere( 'ra.id', '>', lastId )
    .limit( 20 )
  ).length ) {

    // a transfer must also be done in the context of an agenda
    for ( const ref of refs ) {

      await config.queue( { job: 'transfer', formSchemaId, identifier: ref.uid, agendaId } );

    }

    lastId = _.last( refs ).ra_id;

  }

}