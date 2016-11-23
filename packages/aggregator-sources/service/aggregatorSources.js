const w = require( 'when' );
const { parseListArguments } = require( 'service-utils' );

let config;
let knex;

module.exports = Object.assign( service, { init } );


function service( reviewId ) {
  return {
    list: list.bind( null, reviewId )
  };
}

function init( c, k ) {
  config = c;
  knex = k;
}


function list( reviewId, query, offset, limit, options, cb ) {

  const args = parseListArguments.apply( null, Array.from( arguments ).slice( 1 ) );

  args.reviewId = reviewId;
  args.params = Object.assign( {}, {
    total: false
  }, args.options );

  const { schemas } = config;
  const baseRequest = knex( schemas.aggregatorSource + ' as s' )
    .leftJoin( schemas.agenda + ' as r', 's.review_id', 'r.id' )
    .leftJoin( schemas.aggregator + ' as agg', 'agg.id', 's.aggregator_id' )
    .where( 'agg.review_id', args.reviewId );

  const promise = w( Object.assign( {}, args, {
    options: undefined,
    reviews: [],
    total: null,
    knex: baseRequest
  } ) )
    .then( _search )
    .then( _total )
    .then( _list );

  if ( typeof arguments[ arguments.length - 1 ] === 'function' ) {
    promise.done( v => args.cb( null, v.reviews, v.total ), args.cb );
  } else {
    return promise.then( v => ({ reviews: v.reviews, total: v.total }) );
  }

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
