"use strict";

const _ = require( 'lodash' );

module.exports = ( dirtyIdentifiers, dirtyData, dirtyOptions, dirtyCallback ) => {

  if ( dirtyCallback !== undefined ) {

    return {
      identifiers: dirtyIdentifiers,
      data: dirtyData,
      options: dirtyOptions,
      cb: dirtyCallback
    }

  }

  if ( dirtyOptions !== undefined && _.isFunction( dirtyOptions ) ) {

    return {
      identifiers: dirtyIdentifiers,
      data: dirtyData,
      options: {},
      cb: dirtyOptions
    }

  }

  if ( dirtyOptions !== undefined ) {

    return {
      identifiers: dirtyIdentifiers,
      data: dirtyData,
      options: dirtyOptions,
      cb: null
    }

  }

  return {
    identifiers: dirtyIdentifiers,
    data: dirtyData,
    options: {},
    cb: null
  }

}