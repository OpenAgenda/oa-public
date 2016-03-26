"use strict";

/**
 * transfer event contribution and
 * ownership to other contributor of agenda
 */

var knex, schemas,

utils = require( 'utils' ),

dbUtils = require( './dbUtils' ),

logger = require( 'basic-logger' ),

w = require( 'when' ),

log = logger( 'transferEvent' );

module.exports = function( agendaId ) {

  return function( params, cb ) {

    w( utils.extend( {

      // given
      agenda: { id: agendaId },
      event: null, // required: event identifiers,
      user: null,   // required: to user identifiers,

      // fetched
      stakeholder: null,
      agendaEvent: null,
      transferedEvent: null

    }, params ) )

    .then( dbUtils.getEvent( 'event', 'transferedEvent' ) )

    .then( dbUtils.getAgendaEvent( 'agenda', 'event', 'agendaEvent' ) )

    .then( dbUtils.getStakeholder( 'agenda', 'user', 'stakeholder' ) )

    .then( _verifyDbFetches )

    .then( dbUtils.updateAgendaEvent( 'agenda', 'event', 'stakeholder' ) )

    .then( _updateOwnership )

    .done( v => {

      cb();

    }, cb );

  }

}

module.exports.init = function( config ) {

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

}


/**
 * check that all objects where loaded nice and clean
 */
function _verifyDbFetches( v ) {

  log( 'verifying fetches' );

  if ( v.transferedEvent === null ) {

    throw 'event was not found';

  }

  if ( v.stakeholder === null ) {

    throw 'stakeholder was not found';

  }

  if ( v.agendaEvent === null ) {

    throw 'event reference was not found';

  }

  return v;

}


/**
 * verify that contributor has contributed event
 */
function _verifyEventContributorAssociation( v ) {

  if ( v.agendaEvent.userId !== v.fromStakeholder.userId ) {

    throw 'user has not contributed event';

  }

  return v;

}


/**
 * update event ownership if belonged to from user
 */
function _updateOwnership( v ) {

  if ( v.transferedEvent.ownerId !== v.agendaEvent.userId ) {

    return v;

  }

  return knex.transaction( trx => {

    return trx.table( schemas.event )

    .where( {
      id: v.transferedEvent.id
    } )

    .update( {
      owner_id: v.stakeholder.userId
    } )

  } )

  .then( result => v );

}