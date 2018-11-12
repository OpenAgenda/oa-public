"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const uuidV4 = require( 'uuid/v4' );

module.exports = async function( config, url, path, event ) {

  const fileKey = _.get( event, 'fileKey' ) || uuidV4().replace( /\-/g, '' );

  return _.assign( await _process(
    config.interfaces.imageFilesLoad,
    config.image.formats,
    fileKey,
    { url, path },
  ), {
    credits: _.get( event, 'image.credits' )
  } );

}

module.exports.hasImage = event => {

  return _.get( event, 'image.path' ) || _.get( event, 'image.url' );

}

async function _process( load, formats, fileKey, urlOrPath ) {

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
