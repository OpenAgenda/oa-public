"use strict";

const files = require( '@openagenda/files' );
const config = require( '../config' );

module.exports.init = config => {

  files.init( {
    bucket: config.aws.bucket,
    accessKeyId: config.aws.accessKeyId, // required
    secretAccessKey: config.aws.secretAccessKey, // required too
    logger: config.getLogConfig( 'svc', 'files', false )
  } );

}
