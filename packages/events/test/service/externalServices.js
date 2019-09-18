"use strict";

const imageFiles = require( '@openagenda/image-files' );
const images = require( '@openagenda/images' );
const files = require( '@openagenda/files' );

module.exports.init = config => {

  files.init( config.files );
  images.init( config.images );
  imageFiles.init( { files, images } );

}

module.exports.imageFiles = imageFiles;

module.exports.getLocations = (uids, options, cb) => {
  cb(null, [{
    name: 'Alice',
    address: '8 rue Alice',
    city: 'Courbevoie'
  }]);
}
