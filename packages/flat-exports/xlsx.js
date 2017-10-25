"use strict";

const XlsxStream = require( 'xlsx-writestream' );
const transform = require( './lib/transform' );
const clean = require( './lib/xlsx/clean' );

module.exports = ( xlsxOptions = {} ) => {

  return xlsx.bind( null, xlsxOptions );  

}

function xlsx( xlsxOptions = {}, inStream, options = {} ) {

  const stream = new XlsxStream();

  const transformed = inStream.pipe( transform( options ) );

  transformed.on( 'data', data => {

    stream.addRow( clean( data ) );

  } );

  transformed.on( 'end', () => stream.finalize() );

  return stream.getReadStream(); 

}