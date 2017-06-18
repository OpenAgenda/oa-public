let log = console.log;

module.exports = ae => {

  log( 'removed agenda-event %s', JSON.stringify( ae ) );

}

module.exports.setLog = l => log = l;