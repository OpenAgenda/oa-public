"use strict";

const newsletter = require( '@openagenda/newsletter' );

module.exports.init = config => {

  newsletter.init( {
    mailjet : config.mailjet,
    logger: config.getLogConfig( 'oa', 'newsletter', false )
  } );

}
