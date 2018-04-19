"use strict";

const fs = require( 'fs' );

module.exports = dirPath => {

  const files = fs.readdirSync( dirPath ).filter( file => file.length > 3 && file.substr( 0, 3 ) === 'tmp' );

  while( files.length ) {

    fs.unlinkSync( dirPath + '/' + files.pop() );

  }

}
