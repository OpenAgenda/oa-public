"use strict";

const newsletter = require( '@openagenda/newsletter' );

module.exports.init = config => {

  newsletter.init( {
    mailjet : config.mailjet,
    logger: {
      debug: {
        prefix: 'oa:'
      },
      token: process.env.NODE_ENV === 'production' ? '89b071bb-a6e9-429b-8e8d-753b8804d577' : null
    }
  } );

}