"use strict";

var q = require( './queue' ),

log = require( 'logger' )( 'services/lib/instanceQueue' );

module.exports = require( '../instanceLoader' )( ( loaded, instance ) => {

  return {
    queue: ( methodName, args ) => {

      let identifiers = _getIdentifiers();

      if ( !identifiers ) {

        log( 'error', 'identifiers missing on instance. cannot queue' );

      } else {

        q( {
          instanceType: instance._instanceType,
          identifiers: _getIdentifiers(),
          methodName: methodName,
          args: args
        } );

      }

    }
  }

  function _getIdentifiers() {

    var identifiers = {};

    [ 'id', 'uid', 'slug' ].forEach( ( field ) => {

      if ( instance[ field ] ) {

        identifiers[ field ] = instance[ field ];

      }

    } );

    return Object.keys( identifiers ).length ? identifiers : false;

  }

} );