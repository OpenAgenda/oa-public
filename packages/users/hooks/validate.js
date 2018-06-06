const schema = require( '@openagenda/validators/schema' );
const { validate: validateHook } = require( 'feathers-hooks-common' );

module.exports = function validate( _schema ) {
  const _validate = schema( _schema );

  return context => validateHook( values => {
    try {
      context.data = _validate( values );
    } catch ( e ) {
      return e;
    }
  } )( context );
};
