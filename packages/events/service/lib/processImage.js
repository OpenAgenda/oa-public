"use strict";

const https = require( 'https' );
const _ = require( 'lodash' );
const uuidV4 = require( 'uuid/v4' );
const axios = require( 'axios' );

const MAX_SIZE = 1024 * 1024 * 20; // 20MB

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  headers: {
    'User-Agent': 'OA',
    'Accept-Charset' : '*',
    'Accept': '*/*'
  },
  timeout: 10000,
  responseType: 'stream',
  maxContentLength: MAX_SIZE
});

const log = require( '@openagenda/logs' )( 'processImage' );

module.exports = async function( config, url, path, event ) {

  const fileKey = _.get( event, 'fileKey' ) || uuidV4().replace( /\-/g, '' );

  return _.assign( await _process(
    config,
    fileKey,
    { url, path },
  ), {
    credits: _.get( event, 'image.credits' )
  } );

}

module.exports.hasImage = event => {

  return _.get( event, 'image.path' ) || _.get( event, 'image.url' );

}

async function _process( config, fileKey, urlOrPath ) {

  log( 'loading images for key %s', fileKey );

  let variants;

  if (urlOrPath.path) {
    variants = await config.upload({ path: urlOrPath.path }, { fileKey });
  } else if (urlOrPath.url) {
    const stream = (await axiosInstance.get(urlOrPath.url)).data;
    variants = await config.upload(stream, { fileKey });
  }

  variants = variants.map(v => ({
    filename: v.filename,
    type: v.type,
    size: v.size
  }));

  log( 'processed image variants for key %s', fileKey, variants );

  return _.extend( _.pick( variants.shift(), [ 'filename', 'size' ] ), { variants } );

}
