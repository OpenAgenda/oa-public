"use strict";

const _ = require( 'lodash' );

/**
 * map a validators-type schema to an elasticsearch mapping
 */

const fieldMap = {
  integer: {
    type: 'integer'
  },
  text: {
    type: 'text'
  },
  phone: {
    type: 'text'
  },
  email: {
    type: 'keyword'
  },
  boolean: {
    type: 'boolean'
  }
}

module.exports = fields => {

  const parsed = {
    search_internal_keywords: {
      type: 'keyword'
    }
  };

  Object.keys( _.isObject( fields ) ? fields : {} ).forEach( f => {

    parsed[ f ] = fieldMap[ fields[ f ].type ];

  } );

  return {
    properties: parsed
  }

}