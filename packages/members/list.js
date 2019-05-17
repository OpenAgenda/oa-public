"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const addListFilters = require( './lib/addListFilters' );
const cleanDbEntry = require( './lib/cleanDbEntry' );
const cleanNav = require( './lib/cleanNav' );
const cleanListOptions = require( './lib/cleanListOptions' );

module.exports = async function( { knex, schema, interfaces }, query, nav = {}, options = {} ) {

  const { from, limit } = cleanNav( nav );

  const {
    detailed,
    total: includeTotal,
    legacy: includeLegacyFields
  } = cleanListOptions( options );

  const k = knex( schema );

  addListFilters( k, query, from );

  const total = includeTotal
    ? await k.count( 'id as total' ).then( r => _.get( r, '0.total' ) )
    : null;

  if ( from ) k.where( 'id', '<', from );

  k.limit( limit ).orderBy( 'id', 'desc' );

  const members = await k.then( rows => rows.map( cleanDbEntry.bind( null, includeLegacyFields ) ) );

  if ( detailed && _.get( interfaces, 'getUsersByUid' ) ) {
    ( await interfaces.getUsersByUid(
      members.map( m => m.userUid )
    ) ).forEach( user => {
      _.find( members, { userUid: user.uid } ).user = user;
    } );
  }

  if ( detailed && _.get( interfaces, 'getEventCountByUserUid' ) ) {
    ( await interfaces.getEventCountByUserUid(
      query.agendaUid,
      members.map( m => m.userUid )
    ) ).forEach( stat => {
      _.find( members, { userUid: stat.userUid } ).eventCount = stat.count;
    } );
  }

  return includeTotal ? {
    members,
    total
  } : members;

}
