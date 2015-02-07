"use strict";

var fs = require('fs'),

cached = {};

module.exports = {
  readFile: readFile
};

function readFile( path, cb ) {

  if ( cached[ path ] ) {

    cb( null, cached[ path ] );

    return;

  }

  fs.readFile( path, 'utf-8', function( err, content ) {

    if ( err ) return cb( err );

    cached[ path ] = content;

    cb( null, content );

  });

}