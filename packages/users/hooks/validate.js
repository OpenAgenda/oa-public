const schema = require( '@openagenda/validators/schema' );
const { BadRequest } = require('@feathersjs/errors');
const { validate: validateHook } = require( 'feathers-hooks-common' );

module.exports = function validate( _schema ) {
  const _validate = schema( _schema );

  return validateHook( ( values, context ) => {
    try {
      context.data = _validate( values );
    } catch ( errors ) {
      throw new BadRequest({ errors });
    }
  } );
};
