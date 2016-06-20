//  enable runtime transpilation to use ES6/7 in node
const ourOwnModules = [
  'users',
  'agenda-categories',
  'agenda-locations',
  'agenda-tags',
  'image-upload',
  'react-timings-picker',
  'spinner',
  'sync-button'
];

var fs = require( 'fs' );

var babelrc = fs.readFileSync( './.babelrc' );
var config;

try {
  config = JSON.parse( babelrc );
  config.ignore = new RegExp( 'node_modules\\/(?!' + ourOwnModules.join( '|' ) + ')' );
} catch ( err ) {
  console.error( '==>     ERROR: Error parsing your .babelrc.' );
  console.error( err );
}

require( 'babel-register' )( config );