"use strict";

module.exports = function ( elem, cb ) {

  if ( !cb ) {
    cb = elem;
    elem = getDefaultElem();
  }

  const container = elem === getDefaultElem() ? getDefaultContainer() : elem;

  function monitor() {

    if ( !elem || !cb ) return;

    const rect = elem.getBoundingClientRect();
    const vpH = viewportHeight();
    const st = elem.scrollTop;
    const ajust = container === getDefaultContainer() ? 0 : rect.bottom - rect.height + rect.top;

    const inVisibleScreenPart = (st + vpH) >= Math.floor( elem.scrollHeight + ajust );

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

function getDefaultElem() {
  return isChrome() ? document.body : document.documentElement;
}

function getDefaultContainer() {
  return isChrome() ? document : window;
}

function isChrome() {
  return !!window.chrome && !!window.chrome.webstore;
}

function isFirefox() {
  return typeof InstallTrigger !== 'undefined';
}

function isIE() {
  return /*@cc_on!@*/false || !!document.documentMode;
}
