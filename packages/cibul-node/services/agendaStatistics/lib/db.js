"use strict";

const _ = require( 'lodash' );
const config = require( '../../../config' );

module.exports = async agendaId => {

  const totals = await config.knex( 'review_article' )
    .select( 'state', 'is_published', config.knex.raw( 'count( id ) as count' ) )
    .groupBy( [ 'state', 'is_published' ] )
    .where( 'review_id', agendaId );

  const result = {
    total: totals.reduce( _r , 0 ),
    published: totals.filter( _published ).reduce( _r, 0 ),
    ready: totals.filter( _ready ).reduce( _r, 0 ),
    toBeCompleted: totals.filter( _toBeCompleted ).reduce( _r, 0 )
  }

  return _.extend( result, {
    checksum: result.published + result.ready + result.toBeCompleted === result.total
  } );

}

function _toBeCompleted( t ) {

  return ( t.state === 0 || t.state === null ) && t.is_published === 0;

}

function _ready( t ) {

  return t.state === 1 && t.is_published === 0;

}

// so this guy is different from agenda-event legacy bridge...
function _published( t ) {

  return t.is_published === 1;

}

function _r( carry, current ) { return carry + current.count }