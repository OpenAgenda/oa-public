"use strict";

const csv = require( 'fast-csv' );

module.exports = ( req, res, next ) => {

  const csvStream = csv.createWriteStream( {
    headers: true,
    delimiter: ';',
    quote: '"',
    escape: '"'
  } );

  req.stream.pipe( csvStream ).pipe( res );

  res.writeHead( 200, {
    'Content-Type' : 'text/csv',
    'content-disposition' : `attachment; filename="${req.agenda.slug}.members.csv"`
  } );

}
