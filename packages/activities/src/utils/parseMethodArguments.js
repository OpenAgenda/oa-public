module.exports = function ( hooks, callFn, options, cb ) {

  const result = {
    hooks,
    callFn,
    options,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 3 ) {

    Object.assign( result, {
      hooks: args[ 0 ],
      callFn: args[ 1 ],
      cb: args[ 2 ]
    } );

  }

  return result;

}