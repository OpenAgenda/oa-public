export default ( {
  scrollableTypes,
  scrollToAnchor
} ) => store => next => action => {

  if ( !window || !scrollableTypes.includes( action.type ) ) return next( action );

  setTimeout( () => {
    _scroll( scrollToAnchor )
  }, 10 );

  next( action );

}

function _scroll( anchor ) {

  try {

    document.getElementById( anchor ).scrollIntoView();

  } catch ( e ) {

    console.log( e );

  }

}
