let log = console.log;

module.exports = ( ae, context ) => {

  log( 'created agenda-event %s with context %s', JSON.stringify( ae ), JSON.stringify( context ) );

  _updateSearch( ae );

  // use context.userUid. will be null when nothing was specified at create

}


async function _updateSearch( ae ) {

  // get the form schema id, the ustom 

}


module.exports.setLog = l => log = l;