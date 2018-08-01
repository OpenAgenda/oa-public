const { alterItems, setByDot } = require( 'feathers-hooks-common' );
const crypto = require( '../utils/crypto' );

module.exports = function generateHash( field ) {
  return alterItems( rec => setByDot( rec, field, crypto.randomHash() ) );
};
