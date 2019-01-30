"use strict";

const imageFiles = require( '@openagenda/image-files' );

module.exports = {
  setImage,
  getImage,
  clearImage
}

function setImage( { path, url }, cb ) {

  let formats = _getFormats.apply( this );

  imageFiles.load( {
    path,
    url,
    formats
  }, ( err, result ) => {

    if ( err ) return cb( err );

    this.service.set( { uid: this.data.uid }, { image: formats[ 0 ].name }, { private: this.data.private }, err => {

      if ( err ) return cb( err );

      this.data.image = formats[ 0 ].name;

      cb( null, result.uploadedPaths );

    } );

  } );

}


function getImage( includePath = false, useDefaultImage = false ) {

  const { defaultImagePath } = this.service.getConfig();
  const path = imageFiles.getBucketPath();
  const image = this.data.image ? this.data.image.split( '/' ).pop() : null;

  if ( image === null ) return useDefaultImage ? defaultImagePath : null;

  return ( includePath ? path : '' ) + image;

}


function clearImage( cb ) {

  let formats = _getFormats.apply( this );

  if ( !this.data.image ) {

    return cb( null, { removed: false, message: 'no image is set' } );

  }

  imageFiles.clear( formats.map( f => f.name ), err => {

    if ( err ) return cb( err );

    this.service.set( { uid: this.data.uid }, { image: null }, { private: this.data.private }, err => {

      if ( err ) return cb( err );

      this.data.image = null;

      cb( err );

    } );

  } );

}


function _getFormats() {

  return [ {
    name: 'agenda' + this.data.uid + '.jpg',
    format: { width: 300, height: 300, crop: true }
  }, {
    name: 'rwtbagenda' + this.data.uid + '.jpg',
    format: { width: 100, height: 100, crop: true }
  }, {
    name: 'agenda' + this.data.uid + '_o.jpg'
  } ];

}
