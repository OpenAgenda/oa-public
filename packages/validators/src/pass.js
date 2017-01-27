"use strict";

import extend from 'lodash/extend';
import listify from './listify';

export default config => {

  const params = extend( {
    field: undefined,
    type: 'pass',
    list: false
  }, config || {} ),

  validator = extend( v => v, {
    type: 'pass',
    field: params.field
  } );

  return params.list ? listify( validator, params ) : validator;  

}