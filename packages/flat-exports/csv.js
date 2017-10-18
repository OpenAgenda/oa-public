"use strict";

const _ = require( 'lodash' );
const fastCsv = require( 'fast-csv' );
const transform = require( './lib/transform' );

module.exports = ( csvOptions = {} ) => {

  return csv.bind( null, _.extend( {
    headers: true,
    delimiter: ',',
    quote: '"',
    escape: '"'
  }, csvOptions ) );

}

function csv( csvOptions = {}, inStream, options = {} ) {

  return inStream

    .pipe( transform( options ) )

    .pipe( fastCsv.createWriteStream( csvOptions ) );

}