"use strict";

/**
 * transfer event contribution and
 * ownership to other contributor of agenda
 */

const w = require( 'when' );

const utils = require( '@openagenda/utils' );
const dbUtils = require( './dbUtils' );

const log = require( '@openagenda/logs' )( 'transferEvent' );

let interfaces, knex, schemas;

module.exports = function ( agendaId ) {

  return function ( params, cb ) {

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

      .then( v => {

        if ( !interfaces || !interfaces.beforeTransferEvent ) return v;

        return new Promise( ( resolve, reject ) => {

          interfaces.beforeTransferEvent( v.transferedEvent.uid, v.transferedEvent.ownerId, v.user.id, err => {

            if (err) return reject( err );

            resolve( v );

          } );

        } );

      } )

      .then( dbUtils.updateAgendaEvent( 'agenda', 'event', 'stakeholder' ) )

      .then( _updateOwnership )

      .done( v => {

        if ( interfaces && interfaces.onTransferEvent ) {

          interfaces.onTransferEvent( v.transferedEvent.uid );

        }

        cb();

      }, cb );

  }

}

module.exports.init = function ( c ) {

  interfaces = c.interfaces;

  schemas = c.schemas;

  knex = c.knex;

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

  return knex.transaction( trx => {

    return trx.table( schemas.event )

      .where( {
        id: v.transferedEvent.id
      } )

      .update( {
        owner_id: v.stakeholder.userId,
        updated_at: new Date()
      } )

  } )

    .then( result => v );

}