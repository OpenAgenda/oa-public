let log = console.log;

module.exports = ( ae, context ) => {

  log( 'removed agenda-event %s with context %s', JSON.stringify( ae ), JSON.stringify( context ) );

  // use context.userUid. will be null if nothing was specified at remove

}

module.exports.setLog = l => log = l;