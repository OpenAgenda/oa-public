const _ = require( 'lodash' );
const errors = require( '@feathersjs/errors' );

module.exports = function verifyPassword( field = 'password' ) {
  return async context => {
    const validPassword = await context.service.verifyPassword(
      { password: _.get( context.data, field ) },
      {
        query: { uid: context.id }
      }
    );

    if ( !validPassword ) {
      throw new errors.BadRequest( 'Bad password', {
        errors: [ {
          field,
          code: 'password.badpassword'
        } ]
      } );
    }
  };
};
