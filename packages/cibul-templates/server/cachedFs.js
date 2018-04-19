"use strict";

var fs = require('fs'),

cached = {},

enabled = true;

module.exports = {
  readFile: readFile,
  disable: disable
};

function readFile( path, cb ) {

  if ( enabled && cached[ path ] ) {

    cb( null, cached[ path ] );

    return;

  }

  fs.readFile( path, 'utf-8', function( err, content ) {

    if ( err ) return cb( err );

    if ( enabled ) cached[ path ] = content;

    cb( null, content );

  });

}

function disable() {

  enabled = false;

}