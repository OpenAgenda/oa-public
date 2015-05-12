"use strict";

var nom = require( '../nominatim' ),

config = require( '../../../config' );

nom.reverse( 48.9030015, 2.2809487, { 
  language: 'fr',
  email: config.adminEmail 
}, function( err, result ) {

  console.log( arguments );

});