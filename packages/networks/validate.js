"use strict";

const _ = require( 'lodash' );

const schema = require( '@openagenda/validators/schema' );

schema.register( {
  integer: require( '@openagenda/validators/integer' ),
  text: require( '@openagenda/validators/text' ),
  date: require( '@openagenda/validators/date' )
} );

module.exports = schema( {
  id: {
    type: 'integer',
    optional: false,
    max: 99999999
  },
  uid: {
    type: 'integer',
    optional: false,
    max: 99999999
  },
  title: {
    type: 'text',
    optional: false,
    min: 2,
    max: 255
  },
  formSchemaId: {
    type: 'integer',
    optional: true,
    max: 99999999
  },
  createdAt: {
    type: 'date',
    optional: false
  },
  updatedAt: {
    type: 'date',
    optional: false
  }
} );
