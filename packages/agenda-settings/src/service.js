const mw = require( './middleware' );

let config;

module.exports = {
  init,
  mw
};

function init( c, cb ) {

  config = c;

  Promise.resolve( c )
    .then( () => {

      mw.init( require( './service' ), c );

    } )

    .then( () => cb ? cb() : null, cb ? cb : null );
}
