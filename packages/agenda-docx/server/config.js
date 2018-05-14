"use strict";

const _ = require( 'lodash' );

const config = {}

module.exports = _.extend( config, { init } );

function init( c ) {

  _.extend( config, c );

}