"use strict";

const _ = require( 'lodash' );

module.exports = ( dirtyIdentifiers, dirtyOptions, dirtyCallback ) => {

  if ( dirtyCallback !== undefined ) {

    return {
      identifiers: dirtyIdentifiers,
      options: dirtyOptions,
      cb: dirtyCallback
    }

  }

  if ( _.isFunction( dirtyOptions ) ) {

    return {
      identifiers: dirtyIdentifiers,
      options: {},
      cb: dirtyOptions
    }

  }

  return {
    identifiers: dirtyIdentifiers,
    options: dirtyOptions,
    cb: null
  }

}