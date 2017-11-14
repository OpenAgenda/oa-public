"use strict";

var config = require( '../../../config' );

module.exports = require( '@openagenda/queue' )( 'instancequeue', { redis: config.redis } );