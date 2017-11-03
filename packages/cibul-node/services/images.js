"use strict";

const images = require( '@openagenda/images' ),

  logger = require( 'logger' );

module.exports.init = config => {

  images.init( {
    tmpPath: config.tmpFolderPath,
    logger
  } );

}