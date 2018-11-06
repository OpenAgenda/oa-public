'use strict';

const os = require( 'os' );
const fs = require( 'fs' );
const path = require( 'path' );
const mkdirp = require( 'mkdirp' );


module.exports = function getCacheDir( name ) {
  const homeCacheDir = path.join( os.homedir(), '.cache' );
  const persistentPath = path.join( homeCacheDir, 'cibul-templates', name );

  if ( fs.existsSync( homeCacheDir ) ) {
    mkdirp.sync( persistentPath );

    return persistentPath;
  }

  return `node_modules/.cache/${name}`;
}
