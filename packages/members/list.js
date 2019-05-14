"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const addListFilters = require( './lib/addListFilters' );
const cleanDbEntry = require( './lib/cleanDbEntry' );
const cleanNav = require( './lib/cleanNav' );
const cleanListOptions = require( './lib/cleanListOptions' );

module.exports = async function( { knex, schema, interfaces }, query, nav = {}, options = {} ) {

  const { from, limit } = cleanNav( nav );

  const { detailed } = cleanListOptions( options );

  const k = knex( schema )
    .limit( limit )
    .orderBy( 'id', 'desc' );

  addListFilters( k, query, from );

  if ( from ) k.where( 'id', '<', from );

  const members = await k.then( rows => rows.map( cleanDbEntry ) );

  if ( detailed && _.get( interfaces, 'getUsersByUid' ) ) {
    ( await interfaces.getUsersByUid(
      members.map( m => m.userUid )
    ) ).forEach( user => {
      _.find( members, { userUid: user.uid } ).user = user;
    } );
  }

  return members;

}
