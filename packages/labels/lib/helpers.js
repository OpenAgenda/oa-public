"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const csv = require( 'fast-csv' );

module.exports = {
  writeCSVFile,
  loadCSVData
}


function loadCSVData( filepath, options = {} ) {

  return new Promise( rs => {

    const entries = [];

    fs.createReadStream( filepath )
      .pipe( csv( _.extend( {
        headers: true,
        delimiter: ';'
      }, options ) ) )
      .on( 'data', data => {

        entries.push( data )

      } )
      .on( 'end', () => {

        rs( entries );

      } );

  } );

}


function writeCSVFile( filepath, rows, options = {} ) {

  return new Promise( ( rs, rj ) => {

    const file = fs.createWriteStream( filepath );

    csv.write( rows, {
      headers: true,
      delimiter: ';'
    } ).pipe( file )

      .on( 'error', err => rj( err ) )

      .on( 'end', () => rs() );

  } );

}
