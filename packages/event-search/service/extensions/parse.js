"use strict";

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
  }
}

module.exports = fields => {

  let parsed = {};

  Object.keys( fields ).forEach( f => {

    parsed[ f ] = fieldMap[ fields[ f ].type ];

  } );

  return {
    properties: parsed
  }

}