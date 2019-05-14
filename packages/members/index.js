"use strict";

const _ = require( 'lodash' );
const get = require( './get' );
const list = require( './list' );
//const create = require( './create' );
//const update = require( './update' );
//const validate = require( './validate' );

module.exports = ( options = {} ) => {

  const config = _.assign( {
    knex: null,
    schema: 'member',
    interfaces: {}
  }, options );

  return {
    get: get.bind( null, config ),
    list: list.bind( null, config ),
    //create: create.bind( null, config ),
    //update: update.bind( null, config ),
    //patch: update.bind( null, _.assign( { patch: true }, config ) ),
    //validate
  }

}

//module.exports.validate = validate;
