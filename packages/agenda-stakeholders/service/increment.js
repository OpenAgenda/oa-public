"use strict";

const _ = require( 'lodash' ),

  VError = require( 'verror' ),

  logger = require( 'basic-logger' );

let knex, schemas, log;

module.exports = _.extend( increment, { init } );

function increment( base, identifiers, cb ) {

  let counterField = 'actions';

  let { agendaId } = base;
  let { userId, id } = identifiers;

  if ( !agendaId ) {

    return cb( new Error( 'agenda id is required' ) );

  }

  if ( !userId && !id ) {

    return cb( new Error( 'stakeholder identifier is required' ) );

  }

  let where = { review_id: agendaId };

  if ( userId ) where.user_id = userId;

  if ( id ) where.id = id;

  knex( schemas.stakeholder )

    .where( where )

    .increment( counterField + '_counter', 1 )

    .asCallback( ( err, rows ) => {

      if ( err ) {

        let error = new VError( err, 'could not increment field %s for stakeholder %s', counterField, JSON.stringify( stakeholder ) );

        if ( cb ) return cb( error );

        return log( 'error', error );

      }

      if ( cb ) return cb( null, { success: true } );

    } );

}


function init( config ) {

  log = logger( 'increment' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

}