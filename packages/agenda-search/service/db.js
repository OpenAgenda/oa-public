"use strict";

var knexLib = require( 'knex' ),

utils = require( 'utils' ),

knex,

async = require( 'async' ),

w = require( 'when' ),

schemas;

const states = {
  published: 2
}

module.exports = init;

utils.extend( module.exports, {
  init: init,
  list: list,
  getDetails: getDetails
} );

function list( offset, limit, cb ) {

  if ( !knex ) return cb( 'no config' );

  knex.transaction( trx => {

    return trx
    .select( 'id', 'uid', 'slug', 'title', 'description', 'image', 'updated_at' )
    .from( schemas.agenda )
    .limit( limit )
    .offset( offset );

  } )

  .then( agendas => {

    let d = w.defer();

    // decorate with details
    async.eachSeries( agendas, ( agenda, ecb ) => {

      getDetails( agenda.id, ( err, details ) => {

        if ( err ) {

          console.error( 'could not retrieve details: %s', err );

          return ecb( err );

        }

        utils.extend( agenda, details );

        ecb();

      } );

    }, err => {

      d.resolve( agendas );

    } );

    return d.promise;

  })

  .then( result => cb( null, result ), cb );

}


function getDetails( agendaId, cb ) {

  if ( !knex ) return cb( 'no config' );

  w( {
    agendaId: agendaId,
    details: {
      publishedEvents: 0,
      upcomingPublishedEvents: 0
    }
  } )

  .then( _getPublishedEvents )

  .then( _getUpcomingPublishedEvents )

  .done( v => {

    cb( null, v.details );

  }, cb );

}

function init( cfg ) {

  schemas = cfg.schemas;

  knex = knexLib( {
    client: 'mysql',
    connection: cfg.mysql
  } );

}


function _getUpcomingPublishedEvents( v ) {

  let today = new Date();

  today = today.getFullYear() + '-' + utils.fZ( today.getMonth() + 1 ) + '-' + utils.fZ( today.getDate() );

  return knex.transaction( trx => {

    return trx

    .count( schemas.agendaEvent + '.id as published_count' )

    .from( schemas.agendaEvent )

    .leftJoin( schemas.occurrence, schemas.agendaEvent + '.event_id', schemas.occurrence + '.event_id' )

    .where( 'review_id', '=', v.agendaId )

    .andWhere( 'state', '=', states.published )

    .andWhere( 'date', '>=', today );

  } )

  .then( result => {

    v.details.upcomingPublishedEvents = result[ 0 ].published_count;

    return v;

  } );

}


function _getPublishedEvents( v ) {

  return knex.transaction( trx => {

    return trx

    .count( 'id as published_count' )

    .from( schemas.agendaEvent )

    .where( 'review_id', '=', v.agendaId )

    .andWhere( 'state', '=', states.published );

  } )

  .then( result => {

    v.details.publishedEvents = result[ 0 ].published_count;

    return v;

  } );

}