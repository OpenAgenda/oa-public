"use strict";

const images = require( '@openagenda/images' );

module.exports.init = config => {

  images.init( {
    tmpPath: config.tmpFolderPath,
    logger: config.getLogConfig( 'svc', 'images', false )
  } );

}
