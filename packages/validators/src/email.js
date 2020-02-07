import extend from 'lodash/extend';
import isEmail from 'validator/lib/isEmail';
import listify from './listify';

export default config => {

  const params = extend( {
    field: undefined,
    error: {
      code: 'email.invalid',
      message: 'email is not valid'
    },
    optional: true,
    type: 'email'
  }, config || {} ),

  validator = extend( validate, {
    type: 'email',
    field: params.field
  } );

  return params.list ? listify( validator, params ) : validator;

  function validate( value ) {

    let clean = typeof value === 'string' ? value.trim() : '';

    if ( !value && params.optional ) {

      return null;

    }

    if ( clean.indexOf( ' ' ) !== -1 || !isEmail( clean ) ) {

      throw [ {
        field: params.field,
        code: params.error.code,
        message: params.error.message,
        origin: value
      } ];

    }

    if ( clean.split( '@' ).length > 2 ) {

      throw [ {
        field: params.field,
        code: params.error.code,
        message: params.error.message,
        origin: value
      } ];

    }

    return clean;

  }

}
