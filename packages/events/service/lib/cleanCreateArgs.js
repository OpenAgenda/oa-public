"use strict";

const _ = require( 'lodash' );

module.exports = ( dirtyData, dirtyOptions, dirtyCallback ) => {

  if ( dirtyCallback !== undefined ) {

    return {
      data: dirtyData,
      options: dirtyOptions,
      cb: dirtyCallback
    }

  }

  if ( _.isFunction( dirtyOptions ) ) {

    return {
      data: dirtyData,
      options: {},
      cb: dirtyOptions
    }

  }

  return {
    data: dirtyData,
    options: dirtyOptions,
    cb: null
  }

}