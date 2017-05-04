"use strict";

const home = require( 'home' );

module.exports.init = ( config, cb ) => {

  home.init( {
    mysql: config.db,
    schemas: config.schemas,
    image: {
      path: config.aws.imageBucketPath.replace( 'cibuldev', 'cibul' ),
      default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
    },
    mw: {
      limit: 20
    }
  }, cb );

}