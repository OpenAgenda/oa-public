"use strict";

const log = require( '@openagenda/logs' )( 'events/onUpdate' );
const controlDataSvc = require( '../legacy' ).controlData;

const createActivity = require( './lib/createActivity' );

module.exports = async (services, before, after, context) => {
  log( 'info', 'updated event %s', after.uid, { context } );

  if ( after.draft ) return;

  services.eventSearch.events.batch.update(after, context); // context should have agendaUid && updateSearchIndex options

  try {
    await createActivity( before, after, context );
  } catch ( e ) {
    log( 'error', 'failed to create activity', e );
  }

  try {
    await controlDataSvc.queue( 'batch', after );
  } catch ( e ) {
    log( 'error', 'failed batch update of control data', e );
  }

}
