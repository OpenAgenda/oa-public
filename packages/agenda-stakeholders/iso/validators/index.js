"use strict";

module.exports = Object.assign( clean, {
  listQuery: require( './listQuery' ),
  listOptions: require( './listOptions' ),
  getQuery: require( './getQuery' ),
  getOptions: require( './getOptions' ),
  clean
} );

function clean( fnName, values ) {

  let clean = module.exports[ fnName ].default;

  try {

    clean = module.exports[ fnName ]( values );

  } catch( e ) { }

  return clean;

}
