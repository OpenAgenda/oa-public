"use strict";

const _ = require( 'lodash' );
const qs = require( 'qs' );

module.exports = {
  listQuery,
  listLink
}

function listQuery( { query, params } ) {

  return qs.stringify( _.assign( {}, params, query ) );

}

function listLink( root, navigation ) {

  const path = root + ( navigation.page ? `/p/${navigation.page}` : '' );

  const query = _.omit( navigation, [ 'page', 'slug' ] );

  if ( !_.keys( query ).length ) return path;

  return path + '?' + qs.stringify( query );

}
