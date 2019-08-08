"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'list' );

const addListFilters = require( './lib/addListFilters' );
const {
  fromDB
} = require( './lib/transformDBEntry' );

const cleanListOptions = require( './lib/cleanListOptions' );
const addPaginationAndOrder = require( './lib/addPaginationAndOrder' );

module.exports = async function( { knex, schema, interfaces }, query, nav = {}, options = {} ) {
  log( 'processing', query, nav );

  const {
    detailed,
    total: includeTotal,
    legacy
  } = cleanListOptions( options );

  const k = knex( schema );

  addListFilters( k, query );

  const total = includeTotal
    ? await k.clone().count( 'id as total' ).then( r => _.get( r, '0.total' ) )
    : null;

  const {
    orderField
  } = addPaginationAndOrder( k, nav );

  const members = await k.then( rows => rows.map( fromDB.bind( null, {
    includeLegacyFields: legacy,
    orderField
  } ) ) );

  if ( detailed ) {
    members.forEach( m => Object.assign( m, { eventCount: 0 } ) );
  }

  if ( detailed && _.get( interfaces, 'getUsersByUid' ) ) {
    ( await interfaces.getUsersByUid(
      members.map( m => m.userUid ).filter( m => !!m )
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
