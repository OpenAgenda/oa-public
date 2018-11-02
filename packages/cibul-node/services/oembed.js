"use strict";

const _ = require( 'lodash' );

const oembed = require( '@openagenda/oembed' );

module.exports.init = config => {

  oembed.init( {
    options: {
      iframely: {
        key: _.get( config, 'oembed.key' )
      },
      filters: _.get( config, 'oembed.platforms' )
    },
    logger: config.getLogConfig( 'svc', 'oembed' )
  } );

}
