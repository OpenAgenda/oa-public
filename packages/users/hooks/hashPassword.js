const _ = require( 'lodash' );
const crypto = require( '../utils/crypto' );

module.exports = function hashPassword( passwordKey, saltKey ) {
  return context => {
    context.data.password = crypto.hashPassword( _.get( context, passwordKey ), _.get( context, saltKey ) );
  };
};
