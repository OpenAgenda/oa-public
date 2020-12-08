"use strict";

var slug = require( 'slugify' );

module.exports = function( text, randomize ) {

  return slug( text, { lower: true, strict: true } ) + ( randomize ? Math.ceil( Math.random() * 1000 ) : '' );

}
