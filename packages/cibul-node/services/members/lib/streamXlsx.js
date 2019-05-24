"use strict";

const XlsxStream = require( 'xlsx-writestream' );

module.exports = ( req, res, next ) => {

  const stream = new XlsxStream();

  stream.getReadStream().pipe( res );

  req.stream.on( 'data', data => stream.addRow( data ) );

  req.stream.on( 'end', () => stream.finalize() );

  res.writeHead( 200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'content-disposition' : `attachment; filename="contributors.${req.agenda.title}.xlsx"`
  } );

}
