"use strict";

const { promisify } = require('util');

const servicesInit = promisify( require( '../services/init' ) );

module.exports = async ( config, options = {} ) => {

  await servicesInit( config, options );

}