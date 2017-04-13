"use strict";

const _ = require( 'lodash' );

module.exports = ( rules, event, key = 'value' ) => {

  return rules.filter( r => {

    if ( r.query && r.query.tags && !_tags( event.tags, r.query.tags ) ) return false;

    return true;

  } ).map( r => _.get( r, key, null ) );

}

function _tags( evaluated, filter ) {

  if ( !evaluated ) {

    return false;

  }

  if ( filter.filter( f => evaluated.includes( f ) ).length !== filter.length ) {

    return false;

  }

  return true;

}