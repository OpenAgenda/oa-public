"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = ( tagSet = {}, events = [] ) => {

  return events.map( e => ih( e, _setUpdateToFlattenTagGroups( tagSet, e ) ) );

}

function _setUpdateToFlattenTagGroups( tagSet, event ) {

  // update of set values
  const update = _.get( event, 'tagGroups', [] )
    .reduce( ( update, group ) => _.set( update, group.name, {
      $set: group.tags
    } ), {} );

  if ( _.keys( update ) ) {

    update[ '$unset' ] = [ 'tags', 'tagGroups' ];

  }

  return _.get( tagSet, 'groups', [] )
    .filter( g => !_.keys( update ).includes( g.name ) )
    .reduce( ( update, group ) => _.set( update, group.name, {
      $set: []
    } ), update );

}
