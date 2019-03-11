"use strict";

const _ = require( 'lodash' );

const logger = require( '@openagenda/logs' );

const manifest = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/../client/dist/manifest.json', 'utf-8' ) );

const name = JSON.parse(
  require( 'fs' ).readFileSync( __dirname + '/../package.json', 'utf-8' )
).name.split( '/' ).pop();

module.exports = _.assign( ( config = {} ) => {

  return { name, config };

}, {
  router: require( './router' )
} );
