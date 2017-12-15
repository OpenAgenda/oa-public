"use strict";

const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/beforeRemove' );

module.exports = ( ae, context ) => {

  log( 'will remove agenda-event %j', ae, { context } );

}