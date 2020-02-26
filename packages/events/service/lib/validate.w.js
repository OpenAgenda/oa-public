'use strict';

const _ = require('lodash');
const VError = require('verror');
const validate = require('../validate');

module.exports = ( { target, log } ) => v => {

  let validateFunc = v[ target ].draft ? validate.draft : validate;

  try {

    v.clean = validateFunc( v[ target ] );

  } catch( e ) {

    if ( !_.isArray( e ) ) {
      throw new VError({
        name: 'MysticalError',
        cause: e,
        info: v[target],
      }, 'validate exception for %s validate', v[target].draft ? 'draft' : 'regular');
    }

    log( 'validation failed with %s errors', e.length );

    v.errors = v.errors.concat( e );

  }

  return v;

}
