"use strict";

module.exports = function ( elem, cb ) {

  if ( !cb ) {
    cb = elem;
    elem = document.body;
  }

  const container = elem === document.body ? document : elem;

  function monitor() {

    if ( !elem || !cb ) return;

    const rect = elem.getBoundingClientRect();
    const vpH = viewportHeight();
    const st = elem.scrollTop;
    const ajust = container === document ? 0 : rect.bottom - rect.height + rect.top;

    const inVisibleScreenPart = (st + vpH) >= Math.round( elem.scrollHeight + ajust );

    if ( inVisibleScreenPart ) cb();

  }

  if ( typeof elem !== 'undefined' ) {

    container.addEventListener( 'scroll', monitor );

  }

  monitor();

  return () => elem.removeEventListener( 'scroll', monitor );
}

function viewportHeight() {
  const de = document.documentElement;

  if ( !!window.innerWidth ) {
    return window.innerHeight;
  }
  else if ( de && !isNaN( de.clientHeight ) ) {
    return de.clientHeight;
  }

  return 0;
}
