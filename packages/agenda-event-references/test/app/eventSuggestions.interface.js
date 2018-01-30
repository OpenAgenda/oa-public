"use strict";

const _ = require( 'lodash' );

const testSuggestions = JSON.parse( require( 'fs' ).readFileSync( __dirname + '/suggestions.json' ) );

/**
 * the following function is given to service through interface
 */

module.exports = function( agendaId, query, options, cb ) {

  cb( null, testSuggestions );

}