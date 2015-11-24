"use strict";

var config = require( '../../../config' );

module.exports = require( 'queue' )( 'instancequeue', { redis: config.redis } );