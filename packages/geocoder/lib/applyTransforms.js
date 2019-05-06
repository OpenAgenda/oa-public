"use strict";

const _ = require( 'lodash' );

const transforms = require( './transforms.json' );

// easier to troubleshoot if separated
const _test = ( rgx, value ) => ( new RegExp( rgx ) ).test( value );

module.exports = location => {

  const updated = Object.assign( {}, location );

  // location is updated as it goes along transforms
  transforms.forEach( transform => {

    if( !Object.keys( transform.matchEvery )
      .every( field => [].concat( transform.matchEvery[ field ] ).some(
        fieldValue => _test( fieldValue, updated[ field ] )
      ) )
    ) return;

    Object.assign( updated, transform.update );

  } );

  return updated;

}
