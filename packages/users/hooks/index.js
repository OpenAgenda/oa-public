"use strict";

const _ = require( 'lodash' );
const { alterItems } = require( 'feathers-hooks-common' );

const camelCase = alterItems( record => _.mapKeys( record, ( value, key ) => _.camelCase( key ) ) );
const snakeCase = alterItems( record => _.mapKeys( record, ( value, key ) => _.snakeCase( key ) ) );


module.exports = {
  before: {
    all: [ snakeCase ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [ camelCase ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
