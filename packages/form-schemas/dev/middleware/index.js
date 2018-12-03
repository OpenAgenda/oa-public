"use strict";

const _ = require( 'lodash' );
const cases = require( '../cases' );

const mw = require( 'fs' ).readdirSync( __dirname )
  .filter( f => f !== 'index.js' )
  .reduce( ( mw, f ) => _.set( mw, f.split( '.' )[ 0 ], require( './' + f ) ), {} );

module.exports = ( req, res, next ) => {

  const matchingMw = mw[ req.path.split( '/' ).pop() ];

  matchingMw ? matchingMw( req, res, next ) : next();

}
