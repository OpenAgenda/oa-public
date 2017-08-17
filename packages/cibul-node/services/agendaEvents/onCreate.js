let log = console.log;

const eventSearch = require( '../eventSearch' );

module.exports = ( ae, context ) => {

  log( 'created agenda-event %s with context %s', JSON.stringify( ae ), JSON.stringify( context ) );

  eventSearch.agendas( ae.agendaUid ).add( ae.eventUid );

  // use context.userUid. will be null when nothing was specified at create

}


module.exports.setLog = l => log = l;