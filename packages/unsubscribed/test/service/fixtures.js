"use strict";

const fixtures = require( '@openagenda/fixtures' );

module.exports = function( config, files, options, cb ) {

  fixtures.init( { mysql: config.mysql } );

  fixtures( [ {
    table: config.schemas.unsubscribed,
    src: __dirname + '/unsubscribed.data.sql'
  } ].filter( f => files.includes( f.src.split( '/' ).pop().split( '.' )[ 0 ] ) ), options, cb );

}