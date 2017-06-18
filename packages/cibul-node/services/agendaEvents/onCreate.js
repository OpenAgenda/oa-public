let log = console.log;

module.exports = ae => {

  log( 'created agenda-event %s', JSON.stringify( ae ) );

}

module.exports.setLog = l => log = l;