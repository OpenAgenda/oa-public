"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const addListFilters = require( './lib/addListFilters' );
const cleanDbEntry = require( './lib/cleanDbEntry' );

const cleanListOptions = require( './lib/cleanListOptions' );
const addPagination = require( './lib/addPagination' );

module.exports = async function( { knex, schema, interfaces }, query, nav = {}, options = {} ) {

  const {
    detailed,
    total: includeTotal,
    legacy
  } = cleanListOptions( options );

  const k = knex( schema ).orderBy( 'id', 'asc' );

  addListFilters( k, query );

  const total = includeTotal
    ? await k.clone().count( 'id as total' ).then( r => _.get( r, '0.total' ) )
    : null;

  addPagination( k, nav );

  const members = await k.then( rows => rows.map( cleanDbEntry.bind( null, legacy ) ) );

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

  return includeTotal || legacy ? {
    [ legacy ? 'stakeholders' : 'members' ] : members,
    ... ( total ? { total } : {} )
  } : members;

}
