"use strict";

const _ = require( 'lodash' );

module.exports = require( 'fs' ).readdirSync( __dirname )
  .filter( f => f !== 'index.js' )
  .reduce( ( mw, f ) => _.set( mw, f.split( '.' )[ 0 ], require( './' + f ) ), {} );
