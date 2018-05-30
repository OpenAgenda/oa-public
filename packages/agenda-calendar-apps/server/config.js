"use strict";

const _ = require( 'lodash' );

const config = {
  layout: () => 'layout is not initialized'
};

module.exports = _.extend( config, { init } );

function init( c ) {

  _.extend( config, c );

}