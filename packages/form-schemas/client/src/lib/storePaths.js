"use strict";

import _ from 'lodash';

module.exports = config => {

  if ( _.get( config, 'type' ) !== 's3' ) {

    throw new Error( 'unknown store type: ' + _.get( config, 'type' ) );

  }

  return `//${config.bucket}.s3.amazonaws.com`;

}
