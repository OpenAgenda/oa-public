"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const uuidV4 = require( 'uuid/v4' );

module.exports = processImage;

module.exports.w = async function( config, v ) {

  if ( !_.get( v.data, 'image.path' ) && !_.get( v.data, 'image.url' ) ) return v;

  v.clean.fileKey = _.get( v.clean, 'fileKey' ) || uuidV4().replace( /\-/g, '' );

  v.clean.image = _.extend( await processImage( config.interfaces.imageFilesLoad, config.image.formats, v.clean.fileKey, _.pick( v.data.image, [ 'url', 'path' ] ) ), {
    credits: _.get( v, 'clean.image.credits' )
  } );

  return v;

}

async function processImage( load, formats, fileKey, urlOrPath ) {

  const namedFormats = ih( formats, formats.map( f => ( { name: { $set: f.name.replace( '{fileKey}', fileKey ) } } ) ) );

  const { uploadedPaths, infos } = await load( ih( urlOrPath, { preSave: { $set: true }, formats: { $set: namedFormats } } ) );

  // dispatch image sizes in format object
  
  const variants = namedFormats.map( ( f, i ) => ( {
    filename: f.name,
    type: f.variant,
    size: infos[ i ].size
  } ) );

  return _.extend( _.omit( variants.shift(), [ 'type' ] ), { variants } );

}
