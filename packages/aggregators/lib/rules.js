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

    if ( r.truthy ) {

      // passes if all keys in set are truthy
      passes = r.truthy.filter( field => _.isArray( event[ field ] ) ? !!event[ field ].length : !!event[ field ] ).length === r.truthy.length;

    }

    return passes;

  } ).map( r => _.get( r, key, null ) );

  log( 'info', 'evaluating rules %j on event %j: result is %j', rules, event, result );

  return result;

}


function _location( location, filter ) {

  return [].concat( filter ).map( locationFilter => {

    const evaluatedLocationFields = _.keys( locationFilter );

    const matchingFields = evaluatedLocationFields.filter( locationField => location[ locationField ] === locationFilter[ locationField ] );

    return matchingFields.length === evaluatedLocationFields.length;

  } ).filter( matching => matching ).length;

}


function _tags( evaluatedTags, filter ) {

  if ( !evaluatedTags ) {

    return false;

  }

  return !!_.intersection( filter, evaluatedTags ).length;

}
