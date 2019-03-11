"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );

module.exports = ( () => {

  const layouts = _loadLayouts();

  return _.mapValues( layouts, ( { parent, parser, render } ) => {

    return ( content, data = {} ) => {

      const parsedData = parser ? parser( data ) : data;

      const rendered = render( parsedData ).replace( '{content}', content );

      return parent ? module.exports[ parent ]( rendered, parsedData ) : rendered;

    }

  } );

} )();


function _loadLayouts() {

  return fs.readdirSync( __dirname )
    .filter( filename => filename.split( '.' ).length === 1 )
    .filter( filename => ![ 'test' ].includes( filename ) )
    .reduce(
      ( layouts, layoutName ) => _.set( layouts, layoutName, require( __dirname + '/' + layoutName ) ),
    {} );

}
