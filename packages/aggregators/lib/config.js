"use strict";

const _ = require( 'lodash' );

const config = {
  knex: null
};

module.exports = _.extend( config, {
  init: c => _.extend( config, c ),
  get: () => config
} );