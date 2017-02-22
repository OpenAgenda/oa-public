const w = require( 'when' );

let config;
let knex;

module.exports = Object.assign( service, { init } );


function service( userId ) {
  return {
    list: list.bind( null, userId ),
    tests: {
      _cleanListArguments
    }
  };
}

function init( c, k ) {
  config = c;
  knex = k;
}


function list( userId, query, offset, limit, options, cb ) {

  const args = _cleanListArguments.apply( null, arguments );
  args.params = Object.assign( {}, {
    total: false
  }, args.options );

  const { schemas } = config;
  const baseRequest = knex( schemas.agenda )
    .leftJoin( schemas.stakeholder, `${schemas.agenda}.id`, `${schemas.stakeholder}.review_id` )
    .where( 'user_id', args.userId );

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

  v.knex.where( 'title', 'like', `%${v.query.search}%` );

  return v;

}

function _total( v ) {

  if ( !v.params.total ) return v;

  return v.knex.clone().count( `${config.schemas.agenda}.id as reviews` )

    .then( result => {

      v.total = result[ 0 ].reviews;

      return v;

    } );

}

function _list( v ) {

  const fields = [ 'uid', 'title', 'slug', 'image', 'official', 'created_at', 'updated_at', 'private' ]
    .map( col => `${config.schemas.agenda}.${col}` )
    .concat( [ `${config.schemas.stakeholder}.credential as credential` ] );

  return v.knex
    .column( fields )
    .distinct( 'uid' )
    .select()
    .orderBy( `${config.schemas.agenda}.updated_at`, 'desc' )
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

function _cleanListArguments( userId, query, offset, limit, options, cb ) {

  if ( arguments.length == 5 && !(query instanceof Object) ) {
    cb = options;
    options = limit;
    limit = offset;
    offset = query;
    query = {};
  } else if ( arguments.length == 5 && typeof options == 'function' ) {
    cb = options;
    options = {};
  } else if ( arguments.length == 4 ) {
    cb = limit;
    limit = offset;
    offset = query;
    query = {};
    options = {};
  }

  return { userId, query, offset, limit, options, cb };
}
