"use strict";

module.exports = function( extension ) {

  return function( loadedInstance, instance, methods ) {

    var ext = extension( loadedInstance, instance );

    methods.forEach( function( m ) {

      var namespace = _loadNamespace( loadedInstance, m ),

      name = _loadName( m );

      namespace[ name ] = ext[ name ];

    });

  }

  function _loadNamespace( loadedInstance, m ) {

    var names = m.split( '.' );

    if ( names.length == 1 ) {

      return loadedInstance;

    } else {

      if ( !loadedInstance[ names[ 0 ] ] ) {

        loadedInstance[ names[ 0 ] ] = {};

      }

      return loadedInstance[ names[ 0 ] ];

    }

  }

  function _loadName( name ) {

    return name.split( '.' ).pop();

  }

}
