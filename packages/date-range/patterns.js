"use strict";

var patternLibs = [
  require( './lib/week.pattern.js' )
];

module.exports = function(timezone) {

  var patterns = patternLibs.map(p => p(timezone));

  return {
    add: add,
    render: render
  }

  function add( timing ) {

    patterns.forEach( function( p ) {

      p.add( timing );

    } );

  }

  function render( prefix, lang ) {

    var render;

    if ( arguments.length == 1 ) {

      lang = prefix;

      prefix = false;

    }

    if ( !prefix ) prefix = ' ';

    for (var i = 0; i < patterns.length; i++) {

      render = patterns[ i ].render( lang );

      if ( render ) return prefix + render;

    };

    return '';

  }

}
