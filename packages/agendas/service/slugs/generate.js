"use strict";

var slug = require( 'slug' );

module.exports = function( text, randomize ) {

  return slug( text, { lower: true } ) + ( randomize ? Math.ceil( Math.random() * 1000 ) : '' );

}