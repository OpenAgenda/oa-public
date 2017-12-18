"use strict";

const _ = require( 'lodash' );
const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  text: require( '@openagenda/validators/text' ),
  link: require( '@openagenda/validators/link' )
} );

module.exports = head => {

  return _.extend( validate( head ), {
    custom_namespaces: {
      'ev': 'http://purl.org/rss/1.0/modules/event/'
    }
  } );

}

const validate = schema( {
  title: {
    type: 'text'
  },
  description: {
    type: 'text',
    optional: true
  },
  feedURL: {
    type: 'link',
    optional: false
  },
  siteURL: {
    type: 'link',
    optional: false
  },
  generator: {
    type: 'text',
    default: 'OpenAgenda'
  },
  imageURL: {
    type: 'link',
    optional: true
  },
  language: {
    type: 'text',
    optional: false
  },
  ttl: {
    type: 'integer',
    default: 120
  }
} );