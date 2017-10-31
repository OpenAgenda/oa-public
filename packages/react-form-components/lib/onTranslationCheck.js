"use strict";

var update = require( 'immutability-helper' );

/**
 * >>>>> ES5 AS IS NOT TRANSPILED <<<<<<<<<<<
*/

module.exports = function( tState, check, langCode ) {

  var currentSetIndex = tState
    .sets.map( function( s ) { return s.source; } )
    .indexOf( tState.source ),

    currentChecked = tState.sets[ currentSetIndex ].checked;

  var updated = { sets: {} };

  if ( check ) {

    updated.sets[ currentSetIndex ] = { checked: { $push: [ langCode ] } };

  } else {

    updated.sets[ currentSetIndex ] = { checked: {
      $splice: [[ tState.sets[ currentSetIndex ].checked.indexOf( langCode ), 1 ]]
    } };

  }

  return update( tState, updated );

}