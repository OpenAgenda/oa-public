"use strict";

const _ = require( 'lodash' );
const config = require( '../config' );

module.exports = ( object, aggregator ) => ( {
  list: list.bind( null, object, aggregator )
} );

async function list( object, aggregator, options = {}, depth = 1 ) {

  const params = _.extend( {
    deep: false
  }, options );

  const { interfaces, knex } = config;

  const sources = await knex( 'aggregator_source as ags' )
    .select( '*' ).where( 'ags.aggregator_id', aggregator.id );

  let items = [];

  for ( const source of sources ) {

    const item = {
      object: await interfaces.getObject( { id: source.review_id } )
    }

    items.push( item );

    if ( params.deep ) {

      _.extend( item, { parent: object, depth } );

      const aggregator = await knex( 'aggregator' ).first( 'id' ).where( 'review_id', source.review_id );

      if ( aggregator ) {

        const subItems = await list( item.object, aggregator, params, depth + 1 );

        items = items.concat( subItems );

      }

    }

  }

  return items;
  
}