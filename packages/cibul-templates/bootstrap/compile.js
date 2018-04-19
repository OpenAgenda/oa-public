"use strict";

var sass = require( 'node-sass' ),

fs = require( 'fs' );

sass.render( { file: '_custom-bootstrap.scss' }, function( err, result ) {

  if ( err ) return console.log( err );

  fs.writeFileSync( 'custom-bootstrap.css', result.css.toString() );

});