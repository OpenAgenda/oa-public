const _ = require( 'lodash' );
const w = require( 'when' );
const async = require( 'async' );
const isPromise = require( 'is-promise' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const parseMethodArguments = require( './parseMethodArguments' );

module.exports = Object.assign( method, {
  handleHook,
  composeHook,
  call
} );

function method() {

  const {
    hooks,
    callFn,
    options,
    cb
  } = parseMethodArguments.apply( null, arguments );

  const params = _.merge( {
    defaultHook: {
      result: null,
      error: null,
      fields: [],
      data: {}
    }
  }, options );

  const hook = params.defaultHook;

  const fields = hooks.reduce( ( prev, next ) => {
    return prev.concat( next.field );
  }, [] );

  const promise = new Promise( ( resolve, reject ) => {

    async.compose(
      composeHook( hooks, fields, 'after' ),
      call( callFn ),
      composeHook( hooks, fields, 'before' )
    )( hook, ( err, result ) => {
      if ( err && !hook.error ) hook.error = err;
      hook.error ? reject( hook.error ) : resolve( hook.result );
    } );

  } );

  // before, for:
  //    1. Pre (check, etc)
  //    2. Format
  //    3. Add validator function to a list / or merge schema to a master schema

  // call, for:
  //    1. validate
  //    2. principal call to database

  // after, for:
  //    1. Post (verify, populate, etc)
  //    2. Parse

  return promisePlusCb( promise, arguments );

}

function handleHook( type, hook, step, fields, i ) {
  return [].concat( step[ type ] ).map( v => ( _hook, next ) => {
      next = _.once( next );

      let _field = _.clone( fields[ i ] );
      let field = _.clone( _field );

      const handle = ( err, result ) => {

        if ( !_.isEqual( field, _field ) ) {
          fields[ i ] = _.clone( field );
          _field = _.clone( field );
        }

        if ( type === 'before' ) {
          if ( !_.isEqual( _.last( hook.fields ), _field ) && hook.fields[ i ] ) {
            hook.fields[ hook.fields.length - 1 ] = field;
          } else {
            hook.fields.push( field );
          }
        } else if ( type === 'after' ) {
          const index = hook.fields.findIndex( v => _.isEqual( v, _field ) );
          hook.fields[ index ] = field;
        }

        if ( err ) {
          _hook.error = err;
          return next( _hook );
        }
        if ( result !== undefined ) {
          _hook = result;
        }
        next( null, _hook );
      };

      let res;

      res = v( field, fields, _hook, handle );
      if ( isPromise( res ) ) w( res ).done( handle.bind( null, null ), handle );
    }
  );
}

function composeHook( hooks, fields, type ) {
  return ( hook, cb ) => {

    const _hooks = hooks.reduce( ( prev, next, i ) => {
      if ( next[ type ] ) return prev.concat( handleHook( type, hook, next, fields, i ) );
      return prev.concat( handleHook( type, hook, Object.assign( {}, next, {
        [type]: ( f, fs, _hook, next ) => next()
      } ), fields, i ) );
    }, [] );

    async.compose.apply( null, _hooks.reverse() )( hook, cb );

  };
}

function call( fn ) {
  return ( hook, cb ) => {
    cb = _.once( cb );

    const handle = ( err, result ) => {
      if ( err ) {
        hook.error = err;
        return cb( hook );
      }
      if ( result !== undefined ) {
        hook.result = result;
      }
      cb( null, hook );
    };

    let res;

    res = fn( hook, handle );
    if ( isPromise( res ) ) w( res ).done( handle.bind( null, null ), handle );
  };
}
