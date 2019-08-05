"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' );

const getByEmail = require( './get' ).byEmail;
const patch = require( './patch' );
const create = require( './create' );
const { isSuperiorTo } = require( './lib/compareRoles' );

const defaultQueueName = 'membersBulkSetEmails';

module.exports = Object.assign( setByEmail, {
  task,
  bulk
} );

function task( config ) {

  const {
    queues,
    queueName
  } = Object.assign( {
    queues: null,
    queueName: defaultQueueName
  }, config );

  const q = queues( queueName );

  q.register( {
    setByEmail: setByEmail.bind( null, config )
  } );

  q.run();

}

async function setByEmail( config, data, options = {} ) {

  if ( !_.get( data, 'agendaUid' ) ) {
    throw new Error( 'Bad payload: agendaUid is missing' );
  }

  const member = await getByEmail( config, _.pick( data, [ 'agendaUid', 'email' ] ) );
  const role = _.get( data, 'role' );

  if ( member && isSuperiorTo( role, member.role ) ) {
    return {
      ... ( await patch( config, member.id, { role }, options ) ),
      operation: 'patch'
    }
  } else if ( member ) {
    log( 'info', 'nothing done for member %s', member.id );
    return {
      operation: null
    }
  } else {
    return {
      ...( await create( config, _.assign( data, { custom: { email: data.email } } ), options ) ),
      operation: 'create'
    }
  }

}

async function bulk( config, base, emails = [], options = {} ) {

  const {
    bulkThreshold,
    queues,
    queueName
  } = Object.assign( {
    queues: null,
    queueName: defaultQueueName,
    bulkThreshold: 10
  }, config );

  const queue = queues( queueName );

  const queueJobs = emails.length > bulkThreshold;

  const result = {
    queued: queueJobs ? emails.length : 0,
    processed: []
  };

  for ( const email of emails ) {
    const data = Object.assign( {}, base, { email } );
    queueJobs
      ? await queue( 'setByEmail', data, options )
      : result.processed.push( await setByEmail( config, data, options ) )
  }

  return result;

}
