"use strict";

const _ = require( 'lodash' );

module.exports = ( evaluatedTags, filter ) => {

  if ( !evaluatedTags ) return false;

  return !!_.intersection( [].concat( filter ), [].concat( evaluatedTags ) ).length;

}
