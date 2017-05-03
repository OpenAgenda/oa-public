"use strict";

const _ = require( 'lodash' );

module.exports = ( rules, event, key = 'value' ) => {

  return rules.filter( r => {

    let passes = true;

    if ( r.query ) {

      passes = _.keys( r.query ).filter( field => {

        if ( field === 'tags' ) {

          return _tags( event.tags, r.query.tags );

        }

        return event[ field ] === r.query[ field ];

      } ).length === _.keys( r.query ).length;

    }

    return passes;

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