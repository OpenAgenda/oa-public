"use strict";

const _ = require( 'lodash' );
const file = require( './file' );
const logger = require( '@openagenda/logs' );
const s3 = require( './s3' );

module.exports = { init, file, s3 };

function init( cfg ) {

  const config = _.extend( {
    bucket: false, // required
    accessKeyId: false, // required
    secretAccessKey: false, // required too
    logger: false // not required but nice to have
  }, cfg );

  if ( config.logger ) {

    logger.setModuleConfig( config.logger );

  }

  s3.init( config );

}