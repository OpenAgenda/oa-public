"use strict";

const config = {};
const _ = require( 'lodash' );

module.exports = config;

module.exports.set = function( c ) {

  _.extend( config, c );

}