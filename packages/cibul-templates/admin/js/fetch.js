var remote = require( '../../js/lib/remote' );

module.exports = function( res, cb ) {

  console.log( res );

  remote.get( res, { timeout: 10000 }, function( resultType, data ) {

    if ( resultType !== 'success' ) {

      return cb( resultType );

    }

    if ( !data.success ) {

      return cb( data.message );

    }

    cb( null, data );

  }, true );

}
