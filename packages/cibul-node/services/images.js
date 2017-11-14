"use strict";

const images = require( '@openagenda/images' ),

  logger = require( '@openagenda/logger' );

module.exports.init = config => {

  images.init( {
    tmpPath: config.tmpFolderPath,
    logger
  } );

}