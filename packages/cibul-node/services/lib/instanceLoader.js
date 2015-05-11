"use strict";

var utils = require( '../../lib/utils' );

module.exports = function( extension ) {

  return function( loadedInstance, instance, methods ) {

    var ext = extension( loadedInstance, instance );

    methods.forEach( function( m ) {

      loadedInstance[ m ] = ext[ m ];

    });

  }

}