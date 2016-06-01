"use strict";

var ejs = require( 'ejs' );

module.exports = EJS;

function EJS( options ) {

  this.options = options;

}

EJS.prototype.render = function( data ) {

  return ejs.render( this.options.text, data, this.options );

}