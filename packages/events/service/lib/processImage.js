"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = async ( load, formats, fileKey, urlOrPath ) => {

  const namedFormats = ih( formats, formats.map( f => ( { name: { $set: f.name.replace( '{fileKey}', fileKey ) } } ) ) );

  const { uploadedPaths, infos } = await load( ih( urlOrPath, { formats: { $set: namedFormats } } ) );

  // dispatch image sizes in format object
  
  const variants = namedFormats.map( ( f, i ) => ( {
    filename: f.name,
    type: f.variant,
    size: infos[ i ].size
  } ) );

  return _.extend( _.omit( variants.shift(), [ 'type' ] ), { variants } );

}