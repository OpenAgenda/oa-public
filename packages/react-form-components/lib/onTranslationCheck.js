"use strict";

const update = require( 'react-addons-update' );

module.exports = ( tState, check, langCode ) => {

  const currentSetIndex = tState
    .sets.map( s => s.source )
    .indexOf( tState.source ),

    currentChecked = tState.sets[ currentSetIndex ].checked;

  let updated = { sets: {} };

  if ( check ) {

    updated.sets[ currentSetIndex ] = { checked: { $push: [ langCode ] } };

  } else {

    updated.sets[ currentSetIndex ] = { checked: {
      $splice: [[ tState.sets[ currentSetIndex ].checked.indexOf( langCode ), 1 ]]
    } };

  }

  return update( tState, updated );

}