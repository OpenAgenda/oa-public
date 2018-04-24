"use strict";

const path = require( 'path' );

module.exports = {
  getCallerFile,
  getModule
};

function getCallerFile( stackFilePosition = 1 ) {
  const originalFunc = Error.prepareStackTrace;
  let callerfile;
  let pos = 0;

  try {
    const err = new Error();
    let currentfile;

    Error.prepareStackTrace = ( err, stack ) => stack;

    currentfile = err.stack.shift().getFileName();

    while ( err.stack.length ) {
      callerfile = err.stack.shift().getFileName();

      if ( currentfile !== callerfile ) {
        pos += 1;
        currentfile = callerfile;
      };
      if ( stackFilePosition === pos ) break;
    }
  } catch ( e ) {
  }

  Error.prepareStackTrace = originalFunc;

  return callerfile;
}


function getModule( dir ) {
  if ( dir === '/' ) {
    throw new Error( 'Could not find package.json up from ' + dir );
  } else if ( !dir || dir === '.' ) {
    throw new Error( 'Cannot find package.json from unspecified directory' );
  }

  let contents;
  try {
    contents = require( dir + '/package.json' );
  } catch ( error ) {
  }

  if ( contents ) return dir;

  return getModule( path.dirname( dir ) );
};
