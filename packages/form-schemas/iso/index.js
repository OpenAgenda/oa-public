"use strict";

const types = require( './types' );

const _ = require( 'lodash/core' );

const labels = {
  types: require( 'labels/custom/types' )
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