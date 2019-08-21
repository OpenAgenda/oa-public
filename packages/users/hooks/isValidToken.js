const _ = require( 'lodash' );
const errors = require( '@feathersjs/errors' );

module.exports = function isValidToken( localKey, foreignKey ) {
  return context => {
    console.log( _.get( context, localKey ), _.get( context, foreignKey ) );

    if ( _.get( context, localKey ) !== _.get( context, foreignKey ) ) {
      throw new errors.BadRequest( 'Bad token' );
    }
  };
}
