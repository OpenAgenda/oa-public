"use strict";

module.exports = function( labelSet ) {

  return function( label, values ) {

    if ( !values ) values = {};

    var translation = label;

    if ( labelSet && labelSet[ label ] ) {

      translation = labelSet[ label ];

    }

    for (var key in values) {

      translation = translation.replace( key, values[key] );

    }

    return translation;

  };

}