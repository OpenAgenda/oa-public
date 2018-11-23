import extend from 'lodash/extend';
import listify from './listify';

export default config => {

  const params = extend( {
    field: undefined,
    type: 'pass',
    list: false,
    default: undefined
  }, config || {} ),

  validator = extend( validate, {
    type: 'pass',
    field: params.field
  } );

  return params.list ? listify( validator, params ) : validator;

  function validate( v ) {

    if ( v === undefined && params.default !== undefined ) {

      return params.default;

    }

    return v;

  }

}
