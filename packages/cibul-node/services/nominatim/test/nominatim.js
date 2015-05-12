"use strict";

var nom = require( '../nominatim' );

nom.reverse( 48.9030015, 2.2809487, { language: 'fr' }, function( err, result ) {

  console.log( arguments );

});