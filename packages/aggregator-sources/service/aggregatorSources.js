"use strict";

const w = require( 'when' );
const {
  parseListArguments,
  promisePlusCb,
  identifiers: { clean: cleanIdentifiers }
} = require( '@openagenda/service-utils' );

let config;
let knex;

module.exports = Object.assign( service, { init } );


function service( aggregatorId ) {
  return {
    list: list.bind( null, aggregatorId ),
    createAggregator: remove.bind( null, aggregatorId ),
    remove: remove.bind( null, aggregatorId )
  };
}

function init( c, k ) {
  config = c;
  knex = k;
}


function list( aggregatorId, query, offset, limit, options, cb ) {

  const args = parseListArguments.apply( null, Array.from( arguments ).slice( 1 ) );

  args.aggregatorId = aggregatorId;
  args.params = Object.assign( {}, {
    total: false
  }, args.options );

  const { schemas } = config;
  const baseRequest = knex( schemas.aggregatorSource + ' as s' )
    .leftJoin( schemas.agenda + ' as r', 's.review_id', 'r.id' )
    .leftJoin( schemas.aggregator + ' as agg', 'agg.id', 's.aggregator_id' )
    .where( 'agg.review_id', args.aggregatorId );

  const promise = w( Object.assign( {}, args, {
    options: undefined,
    reviews: [],
    total: null,
    knex: baseRequest
  } ) )
    .then( _search )
    .then( _total )
    .then( _list )
    .then( v => ({ reviews: v.reviews, total: v.total }) );

  return promisePlusCb( promise, arguments );

}

function remove( aggregatorId, identifiers, cb ) {

  const promise = w( {
    aggregatorId,
    identifiers
  } )
    .then( cleanIdentifiers() )
    .then( _populate )
    .then( _remove )
    .then( v => ({ success: true }) );

  return promisePlusCb( promise, arguments );

}

function _search( v ) {

  if ( !v.query.search ) return v;

  v.knex.where( 'r.title', 'like', `%${v.query.search}%` );

  return v;

}

function _total( v ) {

  if ( !v.params.total ) return v;

  return v.knex.clone().count( 'r.id as reviews' )

    .then( result => {

      v.total = result[ 0 ].reviews;

      return v;

    } );

}


function _list( v ) {

  const fields = [ 'uid', 'title', 'slug', 'image', 'official', 'created_at', 'updated_at' ]
    .map( col => `r.${col}` );

  return v.knex
    .column( fields )
    .select()
    .orderBy( 'r.updated_at', 'desc' )
    .offset( v.offset )
    .limit( v.limit )

    .then( reviews => {

      v.reviews = reviews.map( review => {
        review.image = review.image ? config.image.path + review.image : config.image.default;
        return review;
      } );

      return v;

    } );

}


function _populate( v ) {

  let source;

  return w.promise( ( resolve, reject ) => {

    config.interfaces.getAgenda( v.identifiers, ( err, result ) => {

      if ( err ) return reject( err );

      source = result;

      resolve( v );

    } );

  } )

    .then( v => {

      if ( !source ) throw new Error( 'Agenda not found' );

      const { schemas } = config;

      return knex( schemas.aggregatorSource + ' as s' )
        .leftJoin( schemas.agenda + ' as r', 's.review_id', 'r.id' )
        .leftJoin( schemas.aggregator + ' as agg', 'agg.id', 's.aggregator_id' )
        .where( 'agg.review_id', v.aggregatorId )
        .where( 's.review_id', source.id )
        .select( 's.*' )
        .limit( 1 )

        .then( reviews => {

          if ( !reviews.length ) throw new Error( 'This agenda is not a source' );

          v.source = reviews[ 0 ];

          return v;

        } );

    } );

}

function _remove( v ) {

  const { schemas } = config;

  return knex( schemas.aggregatorSource )
    .del()
    .where( 'review_id', v.source.review_id )
    .then( () => v );

}
