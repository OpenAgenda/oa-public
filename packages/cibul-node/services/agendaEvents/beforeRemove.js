"use strict";

const log = require( 'logs' )( 'agendaEvents/interfaces/beforeRemove' );

module.exports = ( ae, context ) => {

  log( 'will remove agenda-event %', ae, { context } );

}