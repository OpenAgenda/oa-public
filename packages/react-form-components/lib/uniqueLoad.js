const load = require( 'load-script' );

let loads = {}

module.exports = ( res, cb ) => {

  if ( loads[ res ] ) {

    loads[ res ].add( cb );

  } else {

    loads[ res ] = _loader( res, cb );

  }

}

function _loader( res, cb ) {

  let loaded = null, cbs = [];

  load( res, ( err, script ) => {

    loaded = { err, script };

    cbs.forEach( cb => cb( err, script ) );

  } );

  add( cb );

  return {
    add
  }

  function add( cb ) {

    if ( loaded ) return cb( loaded.err, loaded.script );

    cbs.push( cb );

  }

}