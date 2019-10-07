"use strict";

const fs = require( 'fs' );
const path = require( 'path' );
const getBabelRule = require( './getBabelRule' );


module.exports = function getBabelModuleRules( modules ) {
  return [].concat( modules )
    .map( mod => {
      const modPath = fs.realpathSync( path.join( require.resolve( `${mod}/package.json` ), '..' ) );

      return getBabelRule( modPath );
    } );
}
