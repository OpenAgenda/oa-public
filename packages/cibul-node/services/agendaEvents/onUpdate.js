let log = console.log;

module.exports = ( before, after ) => {

  log( 'updated agenda-event from %s to %s', JSON.stringify( before ), JSON.stringify( after ) );

}

module.exports.setLog = l => log = l;