"use strict";

const files = require( '@openagenda/files' );
const imageFiles = require( '@openagenda/image-files' );
const images = require( '@openagenda/images' );

module.exports.init = config => {

  imageFiles.init( {
    logger: config.getLogConfig( 'svc', 'imageFiles' ),
    images,
    files
  } );

}
