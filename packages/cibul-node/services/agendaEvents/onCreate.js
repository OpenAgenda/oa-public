let log = console.log;

module.exports = ( ae, context ) => {

  log( 'created agenda-event %s with context %s', JSON.stringify( ae ), JSON.stringify( context ) );

  // use context.userUid. will be null when nothing was specified at create

}

module.exports.setLog = l => log = l;