const _ = require( 'lodash' );
const uuid = require( 'uuid/v4' );

module.exports = function generateToken( key ) {
  return context => {
    _.set( context, key, uuid().replace( /-/g, '' ) );
  };
};
