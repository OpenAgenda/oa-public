"use strict";

/**
 * get all ejs paths in project
 */

var walk = require( 'walk' );

module.exports = function( base, regex, cb ) {

  var walker = walk.walk( base, { 
    followLinks: false,
    filters: [ 'node_modules', 'scripts', '.git' ]
  } ),

  paths = [];

  walker.on( 'file', ( root, stat, next ) => {

    if ( regex.test( stat.name ) ) {

      paths.push( root.replace( base, '' ) + '/' + stat.name );
      
    }

    next();

  } );

  walker.on( 'end', () => cb( null, paths ) );

}