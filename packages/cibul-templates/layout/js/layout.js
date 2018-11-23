"use strict";

if ( !window._babelPolyfill ) require( '@babel/polyfill' );

require( '@openagenda/dom-utils/polyfill' );

var cn = require( '../../js/lib/common/common.mod.js' );

module.exports = {
  getOptions: getOptions
}

function getOptions( selector ) {

  var options = {},

  stringified = cn.el( selector ).getAttribute( 'data-options' );

  if ( !stringified ) return options;

  try {

    options = JSON.parse( stringified );

  } catch( e ) {

    log( 'could not parse options' );

  }

  return options;

}
