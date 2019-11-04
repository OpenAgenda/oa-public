"use strict";

const VError = require( 'verror' );
const _ = require( 'lodash' );

module.exports = (config, ...args) => {

  const err = args.shift();

  if (_.isObject(err) && err.status === 404) {
    return {
      success: false,
      status: 404,
      message: 'index not found'
    }
  }

  if (config.interfaces.onError) {
    config.interfaces.onError(err);
  }

  throw new VError(...[err].concat(args));
}
