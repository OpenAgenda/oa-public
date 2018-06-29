"use strict";

const _ = require( 'lodash' );
const config = require( '../../../config' );

module.exports = async agendaId => {

  const totals = await config.knex( 'review_article' )
    .select( 'state', config.knex.raw( 'count( id ) as count' ) )
    .groupBy( [ 'state' ] )
    .where( 'review_id', agendaId );

  const result = {
    total: totals.reduce( _r , 0 ),
    published: totals.filter( _published ).reduce( _r, 0 ),
    ready: totals.filter( _ready ).reduce( _r, 0 ),
    toBeCompleted: totals.filter( _toBeCompleted ).reduce( _r, 0 ),
    eventServiceTotal: await _eventServiceTotal( agendaId )
  }

  return _.extend( result, {
    checksum: result.published + result.ready + result.toBeCompleted === result.total
  } );

}

function _eventServiceTotal( agendaId ) {

  return config.knex( 'event_2 as e2' )
    .count( 'e2.id as total' )
    .leftJoin( 'event as e', 'e2.uid', 'e.uid' )
    .leftJoin( 'review_article as ra', 'e.id', 'ra.event_id' )
    .where( 'ra.review_id', agendaId )
    .then( r => r[ 0 ].total );

}

function _toBeCompleted( t ) {

  return !t.state;

}

function _ready( t ) {

  return t.state === 1;

}

// so this guy is different from agenda-event legacy bridge...
function _published( t ) {

  return t.state === 2;

}

function _r( carry, current ) { return carry + current.count }