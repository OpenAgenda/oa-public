"use strict";

const _ = require( 'lodash' );

module.exports = ( image, { 
  useDefaultPath,
  defaultPath,
  imagePath
} ) => {

  let defaultPathParts;

  image.base = imagePath;

  if ( image.filename || !useDefaultPath ) return image;

  defaultPathParts = defaultPath.split( '/' );

  image.filename = defaultPathParts.pop();

  image.base = defaultPathParts.join( '/' );

  return image;

}