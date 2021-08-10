"use strict";

const fs = require( 'fs' );

module.exports = {
  getCss: name => fs.readFileSync( __dirname + '/compiled/' + name + '.css', 'utf-8' )
}