"use strict";

const types = Object.keys( require( './types' ) );

const _ = require( 'lodash/core' );

const labels = {
  types: require( '@openagenda/labels/custom/types' )
}

module.exports = {
  getTypeLabels,
  validateField: require( './validateField' ),
  FormSchema: require( './FormSchema' )
}

function getTypeLabels( type = false ) {

  return types

    .filter( t => type === false || t === type )

    .map( t => ( { 
      type: t, 
      label: labels.types[ t ]
    } ) );

}