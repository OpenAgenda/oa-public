"use strict";

const { promisify } = require( 'util' );
const facebook = require( '@openagenda/facebook' );

module.exports.init = async config => {

  await promisify( facebook.init )( {
    app: config.auth.facebook,
    routes: {
      tabRedirect: config.root + '/facebook/tab/create/:state'
    },
    query: _query,
    db: config.db
  } );

  function _query( queryStr, values, cb ) {

    if ( arguments.length === 2 ) {

      cb = values;
      values = [];

    }

    const query = config.knex.raw( queryStr, values );

    query
      .then(
        result => result[ 0 ],
        err => {

          process.nextTick( () => cb( err ) );

        }
      )
      .then( rows => {

        process.nextTick( () => cb( null, rows ) );

      } );

  }

}
