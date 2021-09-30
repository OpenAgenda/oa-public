export default function clientMiddleware( helpers ) {
  return store => next => action => {
    if ( typeof action === 'function' ) {
      return action( store );
    }

    const { promise, types, ...rest } = action;

    if ( !promise ) {
      return next( action );
    }

    const [ REQUEST, SUCCESS, FAILURE ] = types;
    next( { ...rest, type: REQUEST } );

    const actionPromise = Promise.resolve( promise( helpers, store ) );

    actionPromise
      .then( result => next( { ...rest, result, type: SUCCESS } ), error => next( { ...rest, error, type: FAILURE } ) )
      .catch( error => {
        console.error( 'MIDDLEWARE ERROR:', error );
        return next( { ...rest, error, type: FAILURE } );
      } );

    return actionPromise;
  };
}
