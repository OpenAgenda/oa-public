"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'rules' );

module.exports = ( rules, event, key = 'value' ) => {

  const result = rules.filter( r => {

    let passes = true;

    if ( r.query ) {

      passes = _.keys( r.query ).filter( field => {

        if ( field === 'tags' ) {

          return _tags( event.tags, r.query.tags );

        }

        if ( field === 'location' ) {

          return _location( event.location, r.query.location );

        }

        return event[ field ] === r.query[ field ];

      } ).length === _.keys( r.query ).length;

    }

    return passes;

  } ).map( r => _.get( r, key, null ) );

  log( 'info', 'evaluating rules %j on event %j: result is %j', rules, event, result );

  return result;

}


function _location( location, filter ) {

  const differentFields = _.keys( filter )
    .filter( locationField => location[ locationField ] !== filter[ locationField ] );

  return !differentFields.length;

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
