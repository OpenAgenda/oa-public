"use strict";

var utils = require( '@openagenda/utils' );

module.exports = {
  parseQueryList: parseQueryList
}

function parseQueryList( v ) {

  return utils.isArray( v ) ? v : [ v ];

}