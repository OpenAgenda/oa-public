"use strict";

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  text: require( '@openagenda/validators/text' ),
  link: require( '@openagenda/validators/link' ),
  pass: require( '@openagenda/validators/pass' )
} );

module.exports = schema( {
  current: {
    list: true,
    fields: {
      link: {
        type: 'link',
        optional: false
      },
      data: {
        type: 'pass',
        optional: false
      }
    }
  }
} );
