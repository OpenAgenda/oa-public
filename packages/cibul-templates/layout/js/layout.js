"use strict";

require( 'dom4' );
require( 'pepjs' );

require( 'intl' );
require( 'intl/locale-data/jsonp/fr' );
require( 'intl/locale-data/jsonp/en' );
require( 'intl/locale-data/jsonp/de' );
require( 'intl/locale-data/jsonp/br' );

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
